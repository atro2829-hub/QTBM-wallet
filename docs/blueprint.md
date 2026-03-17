# **App Name**: QTBM Wallet

## Core Features:

- User Account Management: Secure user registration, login with email/password, and generation of a unique User ID (UID) for secure transactions.
- Multi-Currency Wallet View: Display real-time balances for Yemeni Rial (YER), US Dollar (USD), and Saudi Riyal (SAR) in a clear, distinct manner with privacy toggle.
- Fund Deposit Request Submission: Users submit requests for fund deposits (to predefined bank or cryptocurrency addresses) with transaction details for admin verification.
- Peer-to-Peer Transfer Submission: Users initiate fund transfers to other user UIDs, with amounts held as pending until administrator approval.
- Comprehensive Transaction History: Provide a detailed and filterable log of all past wallet transactions including deposits, transfers, and service payments with status indicators.
- AI-Powered Voice Command Input Tool: An accessible central button for natural language interaction, leveraging Genkit and Gemini models to parse commands and pre-fill forms like 'Send 50 dollars to user123'.
- Admin Transaction Management: An admin panel to review and approve/reject incoming deposit requests and pending user-to-user transfers, with automatic balance updates upon approval.

## Style Guidelines:

- Primary color: A strong, confident Red (#E52E2E) for branding elements, main calls to action, and active states.
- Background for Light Mode: A clean, off-white (#FDFDFE) to reduce clutter and ensure high readability.
- Background for Dark Mode: A deep charcoal (#010411) for a sophisticated and comfortable viewing experience.
- Accent color: A soft blue (#BDCEDF) for secondary elements, cards, and input fields. Soft greys are also used for subtle highlights.
- Semantic colors: Green for successful operations or received funds, and red/orange to signify destructive actions, failed transactions, or warnings.
- The 'Tajawal' font for both headlines and body text, providing excellent readability in English and Arabic with a modern, friendly appearance. Note: currently only Google Fonts are supported.
- Use icons from the 'lucide-react' library for a consistent, lightweight, and professional visual language throughout the application.
- Minimalist and flat aesthetic with generous use of whitespace. User UI features a dynamic balance carousel, a 3x3 action grid, and a bottom navigation bar with an elevated central voice command button.
- Transaction and form pages utilize clean, centered card layouts. The admin panel employs a two-column layout with a navigation sidebar and content area, optimized for data presentation.
- Subtle transitions, prominent loading indicators, and immediate feedback animations for interactive elements and form submissions to enhance user experience.