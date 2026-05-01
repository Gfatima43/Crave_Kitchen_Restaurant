/**
 * Crave Kitchen | script.js
 * Requires: jQuery 3.x, Bootstrap 5
 *
 * Contents:
 *  1. Preloader
 *  2. Navbar scroll behaviour
 *  3. Smooth scroll + active nav highlighting
 *  4. Reveal-on-scroll animations (IntersectionObserver)
 *  5. Menu category filter tabs
 *  6. Favourite / heart button toggle
 *  7. Gallery item click (lightbox-lite)
 *  8. Scroll-to-top button
 *  9. Form validation & AJAX submission
 * 10. Miscellaneous micro-interactions
 */

$(function () {
  /* ============================================================
     1. PRELOADER
  ============================================================ */
  // Hide preloader once window is fully loaded
  $(window).on("load", function () {
    setTimeout(function () {
      $("#preloader").addClass("hidden");
      // Trigger hero reveal animations after preloader
      triggerHeroAnimations();
    }, 600);
  });

  // Fallback: hide preloader after 3s even if load stalls
  setTimeout(function () {
    $("#preloader").addClass("hidden");
  }, 3000);

  /* ============================================================
     2. NAVBAR SCROLL BEHAVIOUR
  ============================================================ */
  var $nav = $("#mainNav");

  $(window).on("scroll.navbar", function () {
    if ($(this).scrollTop() > 60) {
      $nav.addClass("scrolled");
    } else {
      $nav.removeClass("scrolled");
    }
  });

  /* ============================================================
     3. SMOOTH SCROLL + ACTIVE NAV LINK HIGHLIGHTING
  ============================================================ */
  // Smooth scroll for all anchor links
  $('a[href^="#"]').on("click", function (e) {
    var target = $(this).attr("href");
    if (target === "#") return;

    var $target = $(target);
    if (!$target.length) return;

    e.preventDefault();

    var offset = $nav.outerHeight() + 10;
    $("html, body").animate(
      { scrollTop: $target.offset().top - offset },
      600,
      "swing",
    );

    // Close mobile menu if open
    $("#navMenu").collapse("hide");
  });

  // Active nav link on scroll (spy behaviour)
  $(window).on("scroll.spy", function () {
    var scrollPos = $(this).scrollTop() + $nav.outerHeight() + 20;

    $('section[id], div[id="contact"]').each(function () {
      var sectionTop = $(this).offset().top;
      var sectionBottom = sectionTop + $(this).outerHeight();
      var sectionId = $(this).attr("id");

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        $(".navbar-nav .nav-link").removeClass("active");
        $('.navbar-nav .nav-link[href="#' + sectionId + '"]').addClass(
          "active",
        );
      }
    });
  });

  /* ============================================================
     4. REVEAL-ON-SCROLL ANIMATIONS (IntersectionObserver)
  ============================================================ */
  function initRevealAnimations() {
    var $revealEls = $(".reveal-up, .reveal-left, .reveal-right, .reveal-card");

    if (!$revealEls.length) return;

    // Use IntersectionObserver for performance
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var el = entry.target;
              var delay = $(el).data("delay") || 0;
              setTimeout(function () {
                $(el).addClass("revealed");
              }, delay);
              observer.unobserve(el); // Animate once only
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );

      $revealEls.each(function () {
        observer.observe(this);
      });
    } else {
      // Fallback: reveal everything immediately
      $revealEls.addClass("revealed");
    }
  }

  initRevealAnimations();

  // Re-run after menu filter (new items become visible)
  function reinitReveal() {
    $(".reveal-up:not(.revealed)").addClass("revealed");
  }

  /* ============================================================
     5. MENU CATEGORY FILTER TABS
  ============================================================ */
  $(".menu-tab").on("click", function () {
    var filter = $(this).data("filter");

    // Update active tab
    $(".menu-tab").removeClass("active");
    $(this).addClass("active");

    // Filter items with animation
    if (filter === "all") {
      $(".menu-item").each(function (i) {
        var $item = $(this);
        setTimeout(function () {
          $item
            .removeClass("hidden")
            .css({ opacity: 0, transform: "translateY(20px)" });
          setTimeout(function () {
            $item.css({
              transition: "opacity .35s ease, transform .35s ease",
              opacity: 1,
              transform: "translateY(0)",
            });
          }, 10);
        }, i * 60);
      });
    } else {
      $(".menu-item").each(function (i) {
        var $item = $(this);
        var category = $item.data("category");

        if (category !== filter) {
          $item.addClass("hidden");
        } else {
          setTimeout(function () {
            $item
              .removeClass("hidden")
              .css({ opacity: 0, transform: "translateY(20px)" });
            setTimeout(function () {
              $item.css({
                transition: "opacity .35s ease, transform .35s ease",
                opacity: 1,
                transform: "translateY(0)",
              });
            }, 10);
          }, i * 60);
        }
      });
    }

    reinitReveal();
  });

  /* ============================================================
     6. FAVOURITE / HEART BUTTON TOGGLE
  ============================================================ */
  $(document).on("click", ".btn-add-fav", function () {
    var $btn = $(this);
    var $icon = $btn.find("i");

    $btn.toggleClass("active");

    if ($btn.hasClass("active")) {
      $icon.removeClass("bi-heart").addClass("bi-heart-fill");
      // Tiny bounce animation
      $btn.css("transform", "scale(1.3)");
      setTimeout(function () {
        $btn.css("transform", "scale(1)");
      }, 200);
    } else {
      $icon.removeClass("bi-heart-fill").addClass("bi-heart");
    }
  });

  /* ============================================================
     7. GALLERY — LIGHTBOX-LITE
  ============================================================ */
  // Simple overlay lightbox when clicking gallery items
  var lightboxHtml =
    '<div id="lightbox" style="' +
    "display:none;position:fixed;inset:0;z-index:2000;" +
    "background:rgba(5,10,48,.95);cursor:zoom-out;" +
    'display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s;">' +
    '<button id="lbClose" style="position:absolute;top:1.5rem;right:2rem;background:none;border:none;' +
    'color:#E8D9C4;font-size:2rem;cursor:pointer;line-height:1;">&#x2715;</button>' +
    '<img id="lbImg" src="" alt="" style="max-height:90vh;max-width:92vw;border-radius:10px;' +
    'box-shadow:0 30px 80px rgba(0,0,0,.6);object-fit:contain;" />' +
    "</div>";

  $("body").append(lightboxHtml);
  var $lb = $("#lightbox");
  $lb.hide(); // Reset the flex display to none first

  // Open lightbox
  $(document).on("click", ".g-item", function () {
    var src = $(this).find("img").attr("src");
    var alt = $(this).find("img").attr("alt");
    $("#lbImg").attr({ src: src, alt: alt });
    $lb.css("display", "flex");
    setTimeout(function () {
      $lb.css("opacity", 1);
    }, 10);
    $("body").css("overflow", "hidden");
  });

  // Close lightbox
  function closeLightbox() {
    $lb.css("opacity", 0);
    setTimeout(function () {
      $lb.css("display", "none");
      $("body").css("overflow", "");
    }, 300);
  }

  $("#lbClose").on("click", closeLightbox);
  $lb.on("click", function (e) {
    if ($(e.target).is($lb)) closeLightbox();
  });
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ============================================================
     8. SCROLL-TO-TOP BUTTON
  ============================================================ */
  var $scrollTop = $("#scrollTop");

  $(window).on("scroll.stt", function () {
    if ($(this).scrollTop() > 400) {
      $scrollTop.addClass("visible");
    } else {
      $scrollTop.removeClass("visible");
    }
  });

  $scrollTop.on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500, "swing");
  });

  /* ============================================================
     9. FORM VALIDATION & AJAX SUBMISSION
  ============================================================ */
  var $form = $("#reservationForm");
  var $submitBtn = $("#submitBtn");
  var $btnText = $submitBtn.find(".btn-text");
  var $btnLoader = $submitBtn.find(".btn-loader");
  var $success = $("#formSuccess");
  var $error = $("#formError");
  var $errorMsg = $("#formErrorMsg");

  // Set minimum date to today
  var today = new Date().toISOString().split("T")[0];
  $("#res_date").attr("min", today);

  /**
   * Validate a single field.
   * Returns true if valid, false if invalid.
   */
  function validateField($field) {
    var $wrap = $field.closest(".col-sm-6, .col-12");

    // Required check
    if ($field.prop("required") && !$field.val().trim()) {
      $wrap.addClass("field-error");
      return false;
    }

    // Email format check
    if ($field.attr("type") === "email" && $field.val().trim()) {
      var emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test($field.val().trim())) {
        $wrap.addClass("field-error");
        $wrap.find(".invalid-msg").text("Please enter a valid email address.");
        return false;
      }
    }

    // Date must not be in the past
    if ($field.attr("type") === "date" && $field.val()) {
      if ($field.val() < today) {
        $wrap.addClass("field-error");
        $wrap.find(".invalid-msg").text("Please choose a future date.");
        return false;
      }
    }

    $wrap.removeClass("field-error");
    return true;
  }

  // Live validation: clear error on change
  $form.on("input change", ".crave-input", function () {
    validateField($(this));
  });

  // Full form validation
  function validateForm() {
    var isValid = true;
    $form.find(".crave-input[required]").each(function () {
      if (!validateField($(this))) isValid = false;
    });
    return isValid;
  }

  // Form submission handler
  $form.on("submit", function (e) {
    e.preventDefault();

    // Run validation
    if (!validateForm()) {
      // Scroll to first error field
      var $firstError = $form.find(".field-error").first();
      if ($firstError.length) {
        $("html, body").animate(
          {
            scrollTop: $firstError.offset().top - 120,
          },
          400,
        );
      }
      return;
    }

    // Hide any previous alerts
    $success.addClass("d-none");
    $error.addClass("d-none");

    // Show loading state
    $btnText.addClass("d-none");
    $btnLoader.removeClass("d-none");
    $submitBtn.prop("disabled", true);

    // Collect form data
    var formData = $form.serialize();

    // AJAX POST to submit.php
    $.ajax({
      url: "submit.php",
      method: "POST",
      data: formData,
      dataType: "json",
      timeout: 15000, // 15 second timeout

      success: function (response) {
        if (response.status === "success") {
          // Show success message
          $success.removeClass("d-none");
          $form[0].reset();
          // Scroll to success message
          $("html, body").animate(
            {
              scrollTop: $success.offset().top - 120,
            },
            400,
          );
        } else {
          // Show server-side error
          $errorMsg.text(
            response.message || "Something went wrong. Please try again.",
          );
          $error.removeClass("d-none");
        }
      },

      error: function (xhr, status) {
        // Network or timeout error
        var msg =
          status === "timeout"
            ? "Request timed out. Please check your connection and try again."
            : "Unable to send your reservation. Please try again later.";
        $errorMsg.text(msg);
        $error.removeClass("d-none");
      },

      complete: function () {
        // Restore button state
        $btnText.removeClass("d-none");
        $btnLoader.addClass("d-none");
        $submitBtn.prop("disabled", false);
      },
    });
  });

  /* ============================================================
     10. MISCELLANEOUS MICRO-INTERACTIONS
  ============================================================ */

  // Navbar brand hover pulse
  $(".navbar-brand")
    .on("mouseenter", function () {
      $(this).find(".brand-mark").css("transform", "scale(1.08)");
    })
    .on("mouseleave", function () {
      $(this).find(".brand-mark").css("transform", "scale(1)");
    });

  // Menu card keyboard accessibility
  $(".menu-card")
    .attr("tabindex", "0")
    .on("keypress", function (e) {
      if (e.key === "Enter") $(this).find(".btn-add-fav").trigger("click");
    });

  // Social link hover ripple effect (footer)
  $(".footer-socials a").on("click", function (e) {
    e.preventDefault(); // placeholder — remove if links are real
  });

  // Animate stat numbers when hero stats become visible
  // (runs via IntersectionObserver defined in initRevealAnimations)
  function animateNumber($el) {
    var target = parseFloat($el.text());
    if (isNaN(target)) return;
    var suffix = $el.text().replace(/[0-9.]/g, "");
    $({ count: 0 }).animate(
      { count: target },
      {
        duration: 1400,
        easing: "swing",
        step: function () {
          $el.text(Math.ceil(this.count) + suffix);
        },
        complete: function () {
          $el.text(target + suffix);
        },
      },
    );
  }

  // Observe stat numbers
  if ("IntersectionObserver" in window) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            $(entry.target)
              .find(".stat-num")
              .each(function () {
                animateNumber($(this));
              });
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );

    $(".hero-stats").each(function () {
      statObserver.observe(this);
    });
  }
}); // end jQuery document ready

/* ============================================================
   HERO ANIMATIONS (called after preloader hides)
   Staggered entrance for hero content elements.
============================================================ */
function triggerHeroAnimations() {
  var $heroEls = $(".hero-section .reveal-up");
  $heroEls.each(function (i) {
    var delay = parseInt($(this).data("delay")) || i * 100;
    var $el = $(this);
    setTimeout(function () {
      $el.addClass("revealed");
    }, delay);
  });
}
