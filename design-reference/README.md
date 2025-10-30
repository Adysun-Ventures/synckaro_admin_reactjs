# Design Reference - Figma Exports

**Source:** Shekru Teacher Dashboard Figma Project  
**Exported:** October 30, 2025  
**Total Files:** 71 screens

---

## ⚠️ CRITICAL INSTRUCTIONS FOR AI AGENTS

### 🚫 DO NOT COPY THESE DESIGNS

**IMPORTANT:** These screenshots are from a **newbie designer** and are **REFERENCE ONLY** for understanding:
- Basic layout concepts
- Page structure ideas
- Feature requirements

### ✅ WHAT TO DO INSTEAD

**BUILD MODERN, PROFESSIONAL UI** using:
1. **Industry-standard UI/UX best practices**
2. **TailwindCSS** with modern utility patterns
3. **Headless UI** components for accessibility
4. **Clean, professional design patterns** (Reference: Vercel, Linear, Stripe dashboards)
5. **Proper spacing, typography, and visual hierarchy**
6. **Modern color palettes and design systems**

### 🎯 Use These Screenshots ONLY For:
- Understanding **what features exist** (not how they look)
- Getting **rough layout ideas** (sidebar left, content right, etc.)
- Identifying **page relationships** and navigation flow
- Knowing **what data fields** are needed

### 🚫 DO NOT Use These Screenshots For:
- ❌ Copying exact colors, fonts, or styling
- ❌ Matching pixel-perfect layouts
- ❌ Replicating poor spacing or alignment
- ❌ Using outdated design patterns
- ❌ Copying amateur design choices

### 💎 Modern UI Standards to Follow:
- **Consistent spacing**: Use TailwindCSS spacing scale (4, 8, 12, 16, 24, 32px)
- **Professional typography**: Clear hierarchy, proper line heights, readable fonts
- **Clean color palette**: Define a cohesive theme (primary, secondary, success, danger, etc.)
- **Proper component states**: Hover, active, focus, disabled states
- **Accessibility**: WCAG AA compliance, keyboard navigation, screen reader support
- **Responsive design**: Desktop and Tablet ONLY (no mobile support - show blocking UI on mobile like dhanhq.co)
- **Component-based architecture**: Build reusable components - one change updates all consumers
- **Loading states**: Skeletons, spinners, proper feedback
- **Error handling**: Clear, helpful error messages
- **Empty states**: Thoughtful messaging when no data exists

---

## 📁 File Organization

### 🔐 Authentication Screens
- `Log in.jpg`, `Log In.jpg` - Login variants
- `Log iN.jpg`, `Log iN-1.jpg`, `Log iN-2.jpg`, `Log iN-3.jpg` - Login flow
- `Log in 4.jpg`, `Log in 5.jpg` - Additional login states
- `Log in LOG.jpg` - Admin login screen

### 🏠 Dashboard & Home
- `Home.jpg` - Main dashboard overview
- `Home-1.jpg` - Dashboard variant
- `Activity LOG.jpg` - Activity logs page

### 👨‍🏫 Teacher Management (Admin)
- `Manage Teacher.jpg`, `Manage Teacher-1.jpg`, `Manage Teacher-2.jpg` - Teacher list/management
- `Teacher List.jpg`, `Teacher List-1.jpg` - Gmail-style teacher list
- `Create Teacher.jpg`, `Create Teacher-1.jpg` - Add teacher form
- `Update Teacher.jpg`, `Update Teacher-1.jpg` - Edit teacher form
- `Delete Teacher.jpg` - Delete confirmation modal
- `View Teacher Details.jpg` - Teacher details page

### 👨‍🎓 Student Management
- `Student View.jpg` - Student details view
- `Delete  Student.jpg` - Delete student confirmation

### 📊 Reports & Stats
- `My Report.jpg`, `My Report-1.jpg` - Personal report overview
- `My Report 5.jpg`, `My Report 6.jpg` - Report variants
- `My Report Detail.jpg`, `My Report Detail 14.jpg` - Detailed report view
- `Teacher Report.jpg`, `Teacher Report-1.jpg`, `Teacher Report 2.jpg` - Teacher reports
- `Teacher Report Detail.jpg` - Teacher report details
- `Teacher Report Details.jpg`, `Teacher Report Details-1.jpg` - More detail views
- `Profile Report.jpg` - Profile-based reports

### 👤 Profile Screens
Multiple profile variations (PNG & JPG):
- `Profile.png`, `Profile.jpg` - Main profile
- `Profile-1` through `Profile-19` - Various profile states and views
- Profile screens cover: user details, settings, configurations

### 📈 Trading Features
- `Order Book.jpg` - Order book view
- `order Book Detail.jpg`, `order Book Detail.png` - Order details
- `Trade Book.jpg` - Trade history
- `Holding.jpg` - Current holdings

### 💳 Subscription Management
- `Manage Subcription.jpg` - Subscription list
- `Create Subcription.jpg` - Add subscription form
- `Update Subcription.jpg` - Edit subscription form
- `View.jpg` - View subscription details

---

## 🎨 Usage Guidelines - READ CAREFULLY

### ⚠️ MANDATORY APPROACH:

**Think of these as "feature requirements sketches" NOT "designs to implement"**

### What These Screenshots Tell You:
1. **"This page needs a table"** → Build a modern, professional table with TailwindCSS
2. **"This page has a sidebar"** → Create a clean, accessible sidebar with proper navigation
3. **"This form has these fields"** → Design a well-structured form with validation and UX
4. **"This is a dashboard with cards"** → Build modern dashboard cards with proper spacing

### How to Implement Each Screen:

**Step 1:** Look at screenshot → Identify WHAT features/components it needs  
**Step 2:** Close the screenshot  
**Step 3:** Build the feature using modern UI/UX best practices  
**Step 4:** Reference screenshot ONLY to verify you didn't miss any features

### Example - "Teacher List" Page:

**❌ WRONG Approach:**
- Try to match the table design from screenshot
- Copy colors, fonts, spacing from image
- Replicate amateur design choices

**✅ CORRECT Approach:**
- See it needs: Bulk selection, search, filters, action menus
- Build Gmail-style professional table using Headless UI
- Use proper spacing (px-6 py-4), modern colors, clear typography
- Add loading states, empty states, error handling
- Make it responsive and accessible

### Modern Design References:
- **Tables**: GitHub pull requests, Linear issues list
- **Forms**: Stripe dashboard, Vercel settings
- **Dashboards**: Vercel analytics, Plausible dashboard
- **Layouts**: Tailwind UI templates, Shadcn UI examples

---

## 🔑 Key Screens Priority

### High Priority (Must Reference):
1. **Home.jpg** - Dashboard layout
2. **Log in LOG.jpg** - Admin login flow
3. **Teacher List.jpg** - Gmail-style table (critical for bulk actions)
4. **Manage Teacher.jpg** - Teacher management interface
5. **Activity LOG.jpg** - Activity logs design
6. **Teacher Report Detail.jpg** - Stats/analytics layout

### Medium Priority:
7. **Profile.jpg** - Profile page structure
8. **My Report.jpg** - Report dashboard
9. **Create Teacher.jpg** - Form design patterns
10. **View Teacher Details.jpg** - Details page layout

### Low Priority (Reference as needed):
- Subscription management screens
- Trading features (Order Book, Trade Book, Holding)
- Profile variations
- Additional report variants

---

## 📝 Important Notes

### About These Designs:
- Created by **newbie designer** - expect inconsistencies and amateur choices
- **Multiple variants** exist - indicates uncertainty, use your best judgment
- **Inconsistent naming/styling** - reinforces these are drafts, not final designs
- Some screens may be from Teacher/Student dashboards - adapt appropriately

### Your Job As AI Agent:
1. **Extract requirements** from screenshots (what features, what data, what pages)
2. **Ignore the visual design** completely
3. **Build professional, modern UI** from scratch
4. **Follow industry standards** for UI/UX
5. **Use best practices** for React, Next.js, TailwindCSS

### Quality Standards:
- Every component should be **production-ready quality**
- Every page should follow **modern UI/UX patterns**
- Every interaction should have **proper feedback**
- Every state should be **properly handled**
- Code should be **clean, maintainable, and well-organized**

### Component-Based Architecture:
- **Build reusable components** - Button, Input, Card, Table, Modal, etc.
- **Single source of truth** - One component file, used everywhere
- **Consistent behavior** - Change once, update everywhere it's used
- **Props-driven** - Make components flexible with props (size, variant, color, etc.)
- **Composition pattern** - Build complex UIs by composing simple components
- **Example**: Create `<Button>` once → Use in forms, headers, modals, tables
  - Update `<Button>` styling → All buttons update automatically
  - Add loading state to `<Button>` → All instances get loading state

### If In Doubt:
- ✅ **Look at Tailwind UI, Shadcn UI, or modern SaaS dashboards for inspiration**
- ✅ **Follow React + Next.js best practices**
- ✅ **Use proper TypeScript types**
- ✅ **Implement accessibility features**
- ❌ **DO NOT try to match the provided screenshots**

---

## 🚀 Development Approach

### Phase 1: Foundation (Modern, Professional)
1. **Core Layout** - Clean sidebar, professional header, spacious content area
2. **Design System** - Define colors, typography, spacing, components
3. **Authentication** - Modern login flow with mobile + OTP
4. **Protected Routes** - Secure, with proper loading states

### Phase 2: Core Features (Industry Standard)
5. **Teacher List** - Gmail-style professional table (reference Linear, GitHub)
6. **Teacher Details** - Clean details page with tabs/sections
7. **Stats Dashboard** - Modern analytics cards (reference Vercel, Plausible)
8. **Activity Logs** - Timeline-style activity feed

### Phase 3: Polish (Production Ready)
9. **Loading States** - Skeletons, spinners, proper feedback
10. **Empty States** - Helpful messages and CTAs
11. **Error Handling** - User-friendly error messages
12. **Responsive Design** - Desktop (1024px+) and Tablet (768px+) only
13. **Mobile Blocking** - Show blocking UI on screens < 768px (like dhanhq.co)

### Remember:
- **Quality over speed** - Build it right the first time
- **Modern patterns** - Use 2025 best practices
- **User experience** - Think about the end user
- **Maintainability** - Write clean, documented code

**Primary Reference:** AGENTS.md for detailed requirements  
**Design Inspiration:** Tailwind UI, Shadcn UI, Modern SaaS dashboards  
**These Screenshots:** Feature requirements ONLY

