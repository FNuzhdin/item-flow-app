# Item Flow Manager

Full-stack application for managing a list of 1,000,000+ items with selection, sorting, and filtering capabilities.

## Features

- **Dual Panel Interface**: Available items (left) and selected items (right)
- **Infinite Scroll**: Loads 20 items at a time for performance
- **Real-time Filtering**: Search by ID with partial matching
- **Drag & Drop**: Reorder selected items with visual feedback
- **Batched Operations**: 
  - Add operations: processed every 10 seconds
  - Select/deselect/reorder: processed every 1 second
- **State Persistence**: Selection and order saved on server
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- In-memory data storage with queue and deduplication

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- @dnd-kit for drag and drop
- Axios for API calls

## Author

FNuzhdin