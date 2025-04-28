
# NL2SQL UI Documentation

This documentation provides an overview of the front-end UI components and styles used in the NL2SQL app, explaining the key aspects of the implementation for a professional and clear understanding.

## Overview

The front-end UI for the NL2SQL application is built using React along with Material UI (MUI) components to ensure a modern, professional, and responsive design. The app's primary functionality revolves around converting natural language to SQL queries, displaying results in an interactive table, and allowing users to interact with various components such as the search bar and data tables.

## Required Modules

1. **React**:
   - Main library used for building the user interface.
   - Version used: 17.x or later.

2. **React Router DOM**:
   - Used for handling routing in the application, allowing navigation between different views (Landing Page and Main Application).
   - Version used: 6.x.

3. **Material UI (MUI)**:
   - Provides a comprehensive set of UI components like buttons, input fields, tables, etc., and implements the app's styling and layout.
   - Version used: 5.x or later.

4. **Axios**:
   - Axios is used for making HTTP requests to the FastAPI backend to fetch SQL query results and handle database connections.
   - Version used: 0.21.x.

5. **CSS**:
   - Global styling is applied using custom CSS files to manage fonts, backgrounds, colors, and transitions.
   - Custom styles are applied to achieve smooth transitions between light and dark modes.

## UI Components Overview

### 1. LandingPage
The LandingPage component serves as the introductory screen for the user. It contains a button to direct users to the main application (/main route). The page includes the NL2SQL app logo, a brief description, and a call to action (CTA) button labeled "Let's Get Started."

### 2. MainApp
The MainApp component represents the core functionality of the app. It contains the search bar for querying natural language input, a data table for displaying query results, and pagination controls for navigating through large datasets. It dynamically handles the connection to the backend and processes user queries.

### 3. SearchBar
The SearchBar allows users to enter natural language queries. It provides autocomplete suggestions for table and column names as the user types. Users can select multiple fields from the same table or multiple tables and enter custom SQL-like queries. Speech recognition is integrated to allow users to speak their queries instead of typing them. The component also displays toast messages when an invalid selection is made, ensuring better UX.

### 4. DataTable
The DataTable displays the results of SQL queries in a structured table format.

Features include:
- **Search**: A search bar for filtering through displayed data.
- **Export**: Options to print or export the data as CSV.
- **Advanced Filtering**: Each column has a dropdown filter for advanced filtering, including sorting (ascending and descending).
- **Pagination**: Supports paginated data display with user-defined limits on rows per page.

### 5. PaginationBox
The PaginationBox manages the display of paginated results in the DataTable. It includes page navigation controls (next, previous) and allows users to set a limit on how many rows to display per page.

## UI Styling

### Global Styling:
- **Body**:
  - Background color: Dark (#181818) for dark mode.
  - Text color: White (#fff) for high contrast.
  - Font family: Arial, sans-serif.

```css
body {
  margin: 0;
  padding: 0;
  font-family: "Arial", sans-serif;
  background-color: #181818;
  color: #fff;
}
```

### Material UI Theme:
- **Palette**: The app dynamically uses a light/dark mode palette.

**Light mode**:
- Background: #f5f5f5 (light gray).
- Paper: #ffffff (white).
- Text: #333333 (dark text) and #555555 (secondary text).

**Dark mode**:
- Background: #181818 (dark gray).
- Paper: #333333 (dark paper).
- Text: #fff (white text) and #bbb (lighter secondary text).

### Typography:
The primary font used is Arial, a simple sans-serif font to ensure readability.

```javascript
const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#555555",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});
```

### Smooth Transition for Theme Change:
The transition between light and dark modes is made smooth using CSS transitions.

```css
html, body {
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}
```

## Routing and Navigation

React Router is used to manage the routing between pages in the application:
- LandingPage is the default route (/).
- MainApp is accessible via /main.

```javascript
<Router>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/main" element={<MainApp />} />
  </Routes>
</Router>
```

## Error Handling

- **Toast Notifications**: The app utilizes toast notifications to inform users of issues like invalid query input or field selection errors.
- **Error Logging**: Errors are logged in the console for debugging, ensuring quick identification of issues.

## Conclusion

The front-end of the NL2SQL application utilizes React for the structure, Material UI for components and design, and Axios for handling communication with the backend. The app's clean, responsive, and user-friendly interface ensures a seamless user experience, with smooth transitions between light and dark modes, intuitive search functionality, and interactive data display features.
