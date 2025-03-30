/**
 * Table Enhancer Bookmarklet - Source Code (v5)
 *
 * Adds filtering and sorting capabilities to HTML tables on webpages.
 * Includes fixes for header row sorting when inside tbody.
 *
 * Features:
 * - Live text filtering input above each table.
 * - Clickable column headers for sorting (alphanumeric/numeric, asc/desc).
 * - Attempts to make header row sticky (dependent on page CSS).
 * - Handles header rows within tbody correctly during sorting and filtering.
 */
(function() {
    'use strict';

    // --- Configuration ---
    const filterInputPlaceholder = 'Search table...';
    const ascendingMark = ' ^'; // Indicator for ascending sort
    const descendingMark = ' v'; // Indicator for descending sort
    const headerClass = 'sortable-header'; // CSS class for header cells
    const filterInputClass = 'table-filter-input'; // CSS class for filter input
    const stickyHeaderBackgroundColor = '#14b8a6'; // Teal background (Tailwind teal-500)
    const stickyHeaderTextColor = '#ffffff'; // White text for header

    // --- Logging Helpers ---
    // Simple console logging wrappers with a prefix for easy identification
    function log(message) { console.log(`[TableEnhancer] ${message}`); }
    function warn(message) { console.warn(`[TableEnhancer] ${message}`); }
    function error(message, err) { console.error(`[TableEnhancer] ${message}`, err || ''); }

    /**
     * Safely gets the text content of a table cell (TD or TH).
     * @param {HTMLElement} td - The table cell element.
     * @returns {string} The text content, or empty string if cell is invalid.
     */
    function getCellText(td) {
        return td ? (td.textContent || td.innerText || '') : '';
    }

    /**
     * Sorts the rows of a table body based on a column index.
     * Excludes the header row if it's found within the tbody.
     * @param {HTMLTableElement} table - The table element.
     * @param {number} colIndex - The index of the column to sort by.
     * @param {boolean} ascending - True for ascending sort, false for descending.
     * @param {number} tableIndex - The 1-based index of the table for logging.
     */
    function sortTableByColumn(table, colIndex, ascending, tableIndex) {
        // Ensure tbody exists
        if (!table.tBodies || table.tBodies.length === 0) {
            warn(`Table ${tableIndex}: No tbody found, skipping sort.`);
            return;
        }
        const tbody = table.tBodies[0];
        // Need at least two rows (header + data or data + data) to sort
        if (tbody.rows.length < 2) {
             log(`Table ${tableIndex}: tbody has less than 2 rows, skipping sort.`);
            return;
        }

        const allRows = Array.from(tbody.rows);
        let headerRowInTbody = null;
        let dataRows = allRows; // Assume all rows are data initially

        // --- Check if the header row is inside the tbody ---
        const potentialHeaderRow = allRows[0];
        // Get header cells (silently, avoid duplicate logs from initial check)
        const headerCells = getTableHeaderCells(table, tableIndex, true);

        // Check if the first cell of the first tbody row matches our identified header cells
        // AND verify that the parent node of the first identified header cell IS the first tbody row.
        // This confirms the header is indeed the first row *within* this tbody.
        if (headerCells.length > 0 && potentialHeaderRow.cells.length > 0 &&
            headerCells.includes(potentialHeaderRow.cells[0]) &&
            headerCells[0].parentNode === potentialHeaderRow)
        {
            log(`Table ${tableIndex}: Header row identified within tbody. Excluding from sort.`);
            headerRowInTbody = potentialHeaderRow; // Store the header row
            dataRows = allRows.slice(1); // Get all rows EXCEPT the header
        }
        // --- End Header Check ---

        // If only the header was in the tbody, nothing left to sort
        if (dataRows.length === 0) {
             log(`Table ${tableIndex}: No data rows to sort after excluding header.`);
             return;
        }

        const direction = ascending ? 1 : -1; // Sort direction multiplier

        // Sort only the data rows
        dataRows.sort((rowA, rowB) => {
            // Safely get cells, handling rows with fewer cells than colIndex
            const cellA = rowA.cells && rowA.cells.length > colIndex ? rowA.cells[colIndex] : null;
            const cellB = rowB.cells && rowB.cells.length > colIndex ? rowB.cells[colIndex] : null;

            // If cells don't exist in one or both rows at this index, consider them equal
            if (!cellA || !cellB) return 0;

            const textA = getCellText(cellA).trim().toLowerCase();
            const textB = getCellText(cellB).trim().toLowerCase();

            // Attempt numeric comparison first
            const numA = parseFloat(textA);
            const numB = parseFloat(textB);

            if (!isNaN(numA) && !isNaN(numB)) { // Both are numbers
                if (numA < numB) return -1 * direction;
                if (numA > numB) return 1 * direction;
                return 0; // Numbers are equal
            } else { // Fallback to alphanumeric comparison
                if (textA < textB) return -1 * direction;
                if (textA > textB) return 1 * direction;
                return 0; // Strings are equal
            }
        });

        // --- Rebuild tbody content ---
        // Clear existing content efficiently
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        // Append header first if it was detached
        if (headerRowInTbody) {
            tbody.appendChild(headerRowInTbody);
        }
        // Append the sorted data rows
        dataRows.forEach(row => tbody.appendChild(row));
        // --- End Rebuild ---

        log(`Table ${tableIndex}: Sorting complete. Updating indicators.`);
        // Update the sort indicators (like ^/v) on the header cells
        updateSortIndicators(table, colIndex, ascending, tableIndex);
    }

    /**
     * Updates the visual indicators (sort arrows) on table header cells.
     * @param {HTMLTableElement} table - The table element.
     * @param {number} sortedColIndex - The index of the column that was just sorted (-1 if none).
     * @param {boolean} ascending - The sort direction.
     * @param {number} tableIndex - The 1-based index of the table for logging.
     */
    function updateSortIndicators(table, sortedColIndex, ascending, tableIndex) {
        // Get header cells (silently)
        const headerCells = getTableHeaderCells(table, tableIndex, true);
         if (!headerCells || headerCells.length === 0) return; // No headers found

        headerCells.forEach((th, index) => {
             if (!th) return; // Skip invalid cells

            // Get current text, removing any existing sort markers
            let currentText = getCellText(th).replace(ascendingMark, '').replace(descendingMark, '').trim();

            // Reapply base styles (cursor, sticky props) as textContent might clear them
            th.style.cursor = 'pointer';
            Object.assign(th.style, {
                position: 'sticky', // Ensure sticky style persists
                top: '0',
                backgroundColor: stickyHeaderBackgroundColor,
                color: stickyHeaderTextColor,
                zIndex: '1',
                padding: '10px 15px', // Reapply padding
                textAlign: 'left' // Reapply alignment
             });

            th.title = 'Click to sort'; // Reset title

            // Add sort marker and update data attribute if this is the sorted column
            if (index === sortedColIndex) {
                currentText += ascending ? ascendingMark : descendingMark;
                th.dataset.sortDirection = ascending ? 'asc' : 'desc'; // Store direction
                 th.title = `Sorted ${ascending ? 'ascending' : 'descending'}. Click to reverse.`;
            } else {
                delete th.dataset.sortDirection; // Remove direction data from other columns
            }
            // Update the cell's text content
            // Note: This clears any other nodes (like icons) inside the header cell.
            th.textContent = currentText;
        });
    }

    /**
     * Filters table rows based on input text, excluding the header row if it's within tbody.
     * @param {HTMLInputElement} input - The filter input element.
     * @param {HTMLTableElement} table - The table element to filter.
     * @param {number} tableIndex - The 1-based index of the table for logging.
     */
    function filterTable(input, table, tableIndex) {
        if (!table.tBodies || table.tBodies.length === 0) {
             warn(`Table ${tableIndex}: No tbody found, skipping filter.`);
            return;
        }
        const tbody = table.tBodies[0];
        const filterText = input.value.toLowerCase().trim(); // Get filter text

        const allRows = Array.from(tbody.rows);
        let headerRowInTbody = null;
        const headerCells = getTableHeaderCells(table, tableIndex, true); // silent=true

        // --- Identify if header is in tbody (similar logic to sort) ---
        if (allRows.length > 0) {
             const potentialHeaderRow = allRows[0];
             if (headerCells.length > 0 && potentialHeaderRow.cells.length > 0 &&
                 headerCells.includes(potentialHeaderRow.cells[0]) &&
                 headerCells[0].parentNode === potentialHeaderRow)
             {
                 headerRowInTbody = potentialHeaderRow;
             }
        }
        // --- End Header Check ---

        // Iterate through all rows in the tbody
        allRows.forEach(row => {
             if(!row) return; // Skip invalid rows

             // *** Crucial: Always show the header row if it's inside the tbody ***
             if (row === headerRowInTbody) {
                 row.style.display = ''; // Ensure header is visible
                 return; // Stop processing for this row (don't filter it)
             }

            // --- Filter Data Rows ---
            let match = false;
            if (!filterText) {
                match = true; // Show row if filter is empty
            } else {
                 // Check if any cell in the row contains the filter text
                 if (row.cells && typeof row.cells[Symbol.iterator] === 'function') {
                    Array.from(row.cells).forEach(cell => {
                        if (getCellText(cell).toLowerCase().includes(filterText)) {
                            match = true; // Found a match
                        }
                    });
                 }
            }
            // Show or hide the data row based on match status
            row.style.display = match ? '' : 'none';
        });
    }

    /**
     * Gets the header cells (TH or TD elements) for a table.
     * Prioritizes the last row of `<thead>`. If no `<thead>`, assumes the first `<tr>` of the table is the header.
     * @param {HTMLTableElement} table - The table element.
     * @param {number} tableIndex - The 1-based index of the table for logging.
     * @param {boolean} [silent=false] - If true, suppress console logs for this call.
     * @returns {Array<HTMLElement>} An array of header cell elements, or empty array if none found.
     */
    function getTableHeaderCells(table, tableIndex, silent = false) {
        const thead = table.tHead;
        // Prefer using thead if it exists
        if (thead && thead.rows.length > 0) {
            if (!silent) log(`Table ${tableIndex}: Found header via thead.`);
            // Use the last row within thead (common for multi-row headers)
            return Array.from(thead.rows[thead.rows.length - 1].cells);
        }
        // Fallback: If no thead, assume the first row of the table is the header
        else if (table.rows && table.rows.length > 0) {
            if (!silent) log(`Table ${tableIndex}: No thead found. Assuming first row is header.`);
            return Array.from(table.rows[0].cells);
        }
        // No rows found at all
        if (!silent) warn(`Table ${tableIndex}: Could not find any rows to determine header.`);
        return [];
    }

    // --- Main Execution Logic ---

    log('Bookmarklet (v5) Activated');
    const tables = document.querySelectorAll('table'); // Find all tables on the page

    if (tables.length === 0) {
        log('No tables found on this page.');
        return; // Exit if no tables
    }

    log(`Found ${tables.length} table(s). Processing...`);

    // Process each table found
    tables.forEach((table, tableIndex) => {
        const currentTableIndex = tableIndex + 1; // Use 1-based index for user-facing logs
        // Wrap processing for each table in try...catch to prevent errors on one table stopping others
        try {
            log(`Processing Table ${currentTableIndex} (ID: ${table.id || 'none'})`);

            // --- 1. Add Filter Input Field ---
            const filterInput = document.createElement('input');
            filterInput.type = 'search'; // Use 'search' type for potential clear button
            filterInput.placeholder = filterInputPlaceholder;
            filterInput.classList.add(filterInputClass);
            // Apply styling to the input field
            Object.assign(filterInput.style, {
                 marginBottom: '15px',
                 padding: '10px 15px',
                 border: '1px solid #d1d5db', // Light gray border
                 borderRadius: '6px',
                 fontSize: '1rem',
                 width: '100%', // Full width of container
                 maxWidth: '500px', // Limit max width
                 display: 'block', // Ensure it takes its own line
                 boxSizing: 'border-box' // Consistent sizing calculation
            });
            filterInput.setAttribute('aria-label', `Filter table ${currentTableIndex}`);
            filterInput.setAttribute('enterkeyhint', 'search'); // Hint for mobile keyboards

            // Add event listener to trigger filtering on input change
            filterInput.addEventListener('input', () => {
                try { // Wrap filter call in try-catch
                     filterTable(filterInput, table, currentTableIndex);
                } catch (filterErr) {
                     error(`Error during filtering Table ${currentTableIndex}`, filterErr);
                }
            });

            // Insert the filter input before the table in the DOM
            if (table.parentNode) {
                table.parentNode.insertBefore(filterInput, table);
                 log(`Table ${currentTableIndex}: Filter input added.`);
            } else {
                // Should rarely happen, but good to check
                warn(`Table ${currentTableIndex}: Could not find parent node to insert filter.`);
            }

            // --- 2. Process Header Cells (Apply Styling & Sorting) ---
            const headerCells = getTableHeaderCells(table, currentTableIndex);

            if (headerCells.length === 0) {
                // If no header cells were found, skip styling and sorting
                warn(`Table ${currentTableIndex}: No header cells identified. Skipping sort/sticky features.`);
            } else {
                log(`Table ${currentTableIndex}: Found ${headerCells.length} header cells. Applying features...`);
                // Iterate through each identified header cell
                headerCells.forEach((th, colIndex) => {
                    if (!th) {
                         warn(`Table ${currentTableIndex}: Header cell at index ${colIndex} is null/undefined. Skipping.`);
                         return; // Skip if cell is invalid
                    }
                    th.classList.add(headerClass); // Add CSS class

                    // Apply base styles (including sticky attempt)
                     Object.assign(th.style, {
                        position: 'sticky', // Attempt sticky positioning
                        top: '0', // Stick to top of scroll container
                        backgroundColor: stickyHeaderBackgroundColor, // Teal background
                        color: stickyHeaderTextColor, // White text
                        zIndex: '1', // Keep header above scrolling content
                        padding: '10px 15px', // Add padding
                        textAlign: 'left', // Align text
                        cursor: 'pointer' // Indicate clickability
                     });
                     th.title = 'Click to sort'; // Set initial tooltip

                    // Add click event listener for sorting
                    th.addEventListener('click', () => {
                        log(`Table ${currentTableIndex}: Clicked header index ${colIndex}. Attempting sort.`);
                        try { // Wrap sort call in try-catch
                            // Determine current sort direction (or default to ascending)
                            const currentDirection = th.dataset.sortDirection;
                            const ascending = currentDirection !== 'asc'; // Toggle direction
                            // Call the sort function
                            sortTableByColumn(table, colIndex, ascending, currentTableIndex);
                        } catch (sortErr) {
                             error(`Error during sorting Table ${currentTableIndex}, Column ${colIndex}`, sortErr);
                        }
                    });
                     log(`Table ${currentTableIndex}: Listener added to header cell ${colIndex}.`);
                });
                // Initialize sort indicators (e.g., remove any initial arrows)
                updateSortIndicators(table, -1, true, currentTableIndex); // -1 = no column sorted initially
                log(`Table ${currentTableIndex}: Header processing complete.`);
            }
        } catch (tableErr) {
            // Catch any unexpected errors during the processing of a single table
            error(`Error processing Table ${currentTableIndex}`, tableErr);
        }
    }); // End loop through tables

    log('Bookmarklet setup finished.');

})(); // End of IIFE wrapper

