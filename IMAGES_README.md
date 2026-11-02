# Atelier Vélin — Food Photography & Asset Management Guide

> **IMPORTANT**: In accordance with production integrity, this project does **not** hotlink arbitrary websites or generate artificial food photos. You should supply your **own high-resolution photos of your cafe's actual food and drinks**, or properly licensed royalty-free photography (e.g. Unsplash or Pexels with attribution).
>
> ❌ **Never use copyrighted photos** scraped from Google Images, Swiggy, Zomato, or competing cafes.

---

## 📸 Recommended Image Specifications

| Property | Requirement | Notes |
| :--- | :--- | :--- |
| **Dimensions** | `1200 × 900 px` | 4:3 landscape aspect ratio matches papercraft cards |
| **Thumbnail Dimensions** | `400 × 300 px` | Generated automatically by the Admin Menu Manager |
| **File Format** | `.webp` (preferred) or `.jpg` / `.png` | WebP gives ~30% smaller size at 80% quality |
| **Max File Size** | `< 5 MB` before client-side compression | Client compresses to ~150–350 KB automatically |
| **Lighting & Composition** | Soft natural sidelight on parchment or dark timber | Complements the tactile papercraft aesthetic |

---

## 📂 Storage Locations

### Option A: Firebase Cloud Storage (Production Recommendation)
When you upload photos using the **Admin Site → Menu Manager** uploader, photos are compressed client-side and saved to your Firebase Storage bucket under:
```text
gs://<your-project-id>.firebasestorage.app/menu/<itemId>/<filename>.webp
gs://<your-project-id>.firebasestorage.app/menu/<itemId>/thumb_<filename>.webp
```

### Option B: Static Bundled Assets (Starter Content)
Place static starter images directly in both application public folders:
- `/apps/customer-site/public/images/menu/<slug>.webp`
- `/apps/admin-site/public/images/menu/<slug>.webp`

---

## 📋 Complete Menu Catalog & File Naming Checklist

Name your image files according to the standardized slug so that the **Bulk Upload Tool** can automatically match them:

| ID | Item Name | Category | Recommended Filename | Status |
| :--- | :--- | :--- | :--- | :---: |
| `m1` | Cardamom & Burnt Honey Cortado | Coffee | `cardamom-burnt-honey-cortado.webp` | 📷 Needed |
| `m2` | Yirgacheffe Single-Origin V60 | Coffee | `yirgacheffe-v60-pourover.webp` | 📷 Needed |
| `m3` | Monsooned Malabar Flat White | Coffee | `monsooned-malabar-flat-white.webp` | 📷 Needed |
| `m4` | Espresso Tonic with Citrus | Coffee | `espresso-tonic-citrus.webp` | 📷 Needed |
| `m5` | 18-Hour Kyoto Slow-Drip Cold Brew | Cold Drinks | `kyoto-slow-drip-cold-brew.webp` | 📷 Needed |
| `m6` | Kashmiri Saffron Iced Latte | Cold Drinks | `kashmiri-saffron-iced-latte.webp` | 📷 Needed |
| `m7` | Smoked Sea Salt Caramel Affogato | Cold Drinks | `smoked-salt-affogato.webp` | 📷 Needed |
| `m8` | Sparkling Hibiscus & Berry Shrub | Cold Drinks | `hibiscus-berry-shrub.webp` | 📷 Needed |
| `m9` | Brown Butter & Fig Kouign-Amann | Bakery | `brown-butter-fig-kouign-amann.webp` | 📷 Needed |
| `m10` | Pistachio & Orange Blossom Pain Suisse | Bakery | `pistachio-pain-suisse.webp` | 📷 Needed |
| `m11` | Smoked Scamorza Morning Bun | Bakery | `smoked-scamorza-morning-bun.webp` | 📷 Needed |
| `m12` | Country Sourdough Loaf (Whole) | Bakery | `country-sourdough-loaf.webp` | 📷 Needed |
| `m13` | Avocado & Whipped Feta Tartine | Breakfast | `avocado-whipped-feta-tartine.webp` | 📷 Needed |
| `m14` | Truffled Mushroom Croque Monsieur | Breakfast | `truffled-mushroom-croque.webp` | 📷 Needed |
| `m15` | Brioche French Toast with Honey | Breakfast | `brioche-french-toast.webp` | 📷 Needed |
| `m16` | Truffle Parmesan Polenta Fries | Snacks | `truffle-parmesan-polenta-fries.webp` | 📷 Needed |
| `m17` | Burrata & Heirloom Tomato Tart | Snacks | `burrata-heirloom-tomato-tart.webp` | 📷 Needed |
| `m18` | Edamame Garlic Hummus Bowl | Snacks | `edamame-garlic-hummus.webp` | 📷 Needed |
| `m19` | 70% Valrhona Dark Chocolate Tart | Desserts | `valrhona-chocolate-tart.webp` | 📷 Needed |
| `m20` | Espresso Tiramisu in Stoneware | Desserts | `espresso-tiramisu-stoneware.webp` | 📷 Needed |
| `m21` | Caramelized Basque Cheesecake | Desserts | `basque-burnt-cheesecake.webp` | 📷 Needed |

---

## ⚡ How the Fallback System Works
If an image is missing or cannot be loaded over a poor cellular connection:
1. The **`ResilientImage`** component renders an elegant tactile papercraft card with:
   - Soft textured parchment background (`#FAF5EC` / `#EFE4D2`)
   - Item's initial stamped in tactile terracotta ink
   - Coffee bean icon watermark
2. Zero layout shift (`aspect-ratio: 4/3` preserved with CSS dimensions).
3. In the **Admin Menu Manager**, any item missing a photo displays a prominent **"Add photo"** prompt and can be filtered using the **"Missing photo"** filter.
