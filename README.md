# 🍴 Crave Kitchen — Restaurant Landing Page

A professional, fully responsive restaurant landing page built with
HTML5 · CSS3 · Bootstrap 5 · jQuery · PHP · MySQL.

---

## 📁 Folder Structure

```
crave-kitchen/
│
├── index.html        ← Main HTML page (all sections)
├── style.css         ← Custom CSS (variables, layout, animations)
├── script.js         ← jQuery interactions, form logic, animations
│
├── config.php        ← Database connection (update credentials here)
├── submit.php        ← Form handler — sanitises input & inserts to DB
├── database.sql      ← MySQL schema + sample data
│
└── README.md         ← This file
```

> **Tip:** In production, move `config.php` **above** the web root
> (`public_html/` / `htdocs/`) and require it by path, so it's never
> directly accessible via URL.

---

## ⚙️ How to Run Locally (XAMPP)

### 1. Install XAMPP
Download from https://apachefriends.org and install for your OS.

### 2. Copy Project Files
Place the `crave-kitchen/` folder inside:
- **Windows:** `C:\xampp\htdocs\`
- **macOS:**   `/Applications/XAMPP/htdocs/`
- **Linux:**   `/opt/lampp/htdocs/`

Result: `C:\xampp\htdocs\crave-kitchen\`

### 3. Start XAMPP Services
Open XAMPP Control Panel and start:
- ✅ Apache
- ✅ MySQL

### 4. Create the Database
1. Open your browser and go to `http://localhost/phpmyadmin`
2. Click **New** (left sidebar) → Name it `crave_kitchen` → Click **Create**
3. Select `crave_kitchen` → click the **SQL** tab
4. Open `database.sql` in a text editor, copy all contents, paste into SQL tab
5. Click **Go** — tables and sample data will be created

### 5. Update Database Credentials
Open `config.php` and update if needed:

```php
define('DB_HOST',  'localhost');  // Usually localhost
define('DB_USER',  'root');       // Default XAMPP username
define('DB_PASS',  '');           // Default XAMPP password (empty)
define('DB_NAME',  'crave_kitchen');
```

### 6. Open the Website
Navigate to: `http://localhost/crave-kitchen/index.html`

---

## 🗄️ Database Structure

### Table: `reservations`
| Column             | Type         | Description                     |
|--------------------|-------------|--------------------------------|
| id                 | INT (PK, AI) | Auto-increment primary key     |
| first_name         | VARCHAR(100) | Guest first name               |
| last_name          | VARCHAR(100) | Guest last name                |
| email              | VARCHAR(255) | Email address                  |
| phone              | VARCHAR(30)  | Phone (optional)               |
| reservation_date   | DATE         | Requested date                 |
| reservation_time   | VARCHAR(20)  | Requested time slot            |
| guests             | VARCHAR(10)  | Number of guests               |
| occasion           | VARCHAR(50)  | Special occasion (optional)    |
| special_requests   | TEXT         | Dietary / seating notes        |
| status             | ENUM         | pending / confirmed / cancelled|
| created_at         | DATETIME     | Submission timestamp           |
| updated_at         | DATETIME     | Last update timestamp          |

---

## 🔒 Security Practices Used

| Practice                   | Where applied         |
|----------------------------|-----------------------|
| `filter_input` + sanitize  | submit.php — all inputs|
| `strip_tags`, `trim`       | sanitizeString()      |
| Prepared statements        | submit.php — INSERT   |
| Server-side validation     | submit.php            |
| Email format validation    | filter_var VALIDATE_EMAIL |
| Date range validation      | PHP DateTime comparison |
| No raw SQL interpolation   | All queries use `?` placeholders |
| Error logging (not exposed)| error_log() server-side |
| Generic client error msgs  | Never leak DB errors  |

---

## 🌐 PHP ↔ MySQL Connection Flow

```
User fills form (index.html)
        │
        ▼  jQuery AJAX POST
submit.php
   ├─ Sanitize inputs (filter_input, strip_tags, trim)
   ├─ Validate (required fields, email format, date)
   ├─ require config.php → createDBConnection() → mysqli
   ├─ Prepare INSERT statement (prepared statement)
   ├─ bind_param() → execute()
   └─ Return JSON {status, message}
        │
        ▼  JSON response
script.js
   └─ Show success / error alert to user
```

---

## 🎨 Design System

| Token         | Value      | Usage                     |
|---------------|-----------|--------------------------|
| --cream       | #E8D9C4   | Page background           |
| --primary     | #785D32   | Buttons, accents, badges  |
| --dark        | #3E160C   | Headings, dark UI         |
| --accent      | #050A30   | Navbar, overlays          |
| --ff-display  | Cormorant Garamond | Headings, hero text |
| --ff-body     | Jost      | Body copy, UI labels      |

---

## 📦 Dependencies (CDN — no npm needed)

| Library       | Version  | Purpose                      |
|---------------|---------|------------------------------|
| Bootstrap     | 5.3.3   | Grid, components, JS utils   |
| Bootstrap Icons| 1.11.3 | Icon font                    |
| jQuery        | 3.7.1   | DOM, AJAX, animations        |
| Google Fonts  | —       | Cormorant Garamond, Jost     |

---

## ✅ Features Checklist

- [x] Responsive navbar with scroll effect
- [x] Animated hero with parallax-like zoom
- [x] Smooth scroll navigation
- [x] Reveal-on-scroll animations (IntersectionObserver)
- [x] Filterable menu grid (Starters / Mains / Desserts / Drinks)
- [x] Heart/favourite toggle on menu cards
- [x] Masonry-style photo gallery
- [x] Click-to-enlarge gallery lightbox
- [x] Testimonials section
- [x] Experience/event banner
- [x] Reservation form with full validation
- [x] jQuery AJAX form submission
- [x] PHP server-side validation & sanitization
- [x] MySQL storage via prepared statements
- [x] Success / error feedback UI
- [x] Scroll-to-top button
- [x] Preloader animation
- [x] Mobile-optimised layout

---

## 🚀 Going Live (Production Checklist)

1. Set a strong MySQL password and update `config.php`
2. Move `config.php` above the web root
3. Enable HTTPS (SSL certificate — free via Let's Encrypt)
4. Add `error_reporting(0)` to PHP files (never show errors publicly)
5. Add rate limiting to `submit.php` (e.g. 5 requests/minute per IP)
6. Consider adding CSRF token protection to the form
7. Replace placeholder images with real photography
8. Update contact details, social links, and menu content