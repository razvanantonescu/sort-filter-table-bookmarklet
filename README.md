# Table Enhancer Bookmarklet

A simple browser bookmarklet to add basic filtering and sorting capabilities to HTML tables on any webpage.


## Features

  * **Live Filtering:** Adds a search input above each detected table to dynamically filter rows based on text content across all columns.
  * **Column Sorting:** Click on table headers (`<th>` or first row `<td>`) to sort the table data by that column (supports basic alphanumeric and numeric sorting). Click again to toggle between ascending (`^`) and descending (`v`) order.
  * **Sticky Header (Attempted):** Applies `position: sticky` styling to the detected header row with a distinct background color (teal) to keep it visible during vertical scrolling *within the table's container*. (Note: This may not work on all websites due to conflicting page CSS).
  * **Lightweight:** Runs entirely in your browser, modifying the current page view temporarily. No external libraries needed.

## Installation

This bookmarklet can be added to most modern web browsers.

**Method 1: Manual (Recommended)**

1.  **Show Bookmarks Bar:** Make sure your browser's bookmarks bar is visible. (Usually `View` -\> `Show Bookmarks Bar` or similar).

2.  **Create New Bookmark:** Right-click on the bookmarks bar and select "Add Page..." or "Add Bookmark..." (the exact wording varies by browser).

3.  **Edit Bookmark:**

      * **Name:** Give it a short, descriptive name, like `Enhance Table` or `Sort/Filter Table`.

      * **URL/Address:** **Delete** any existing content in the URL field and **paste the entire code snippet below** (starting with `javascript:`):

        ```javascript
        javascript:(function()%7B'use strict'%3Bconst filterInputPlaceholder%3D'Search table...'%3Bconst ascendingMark%3D'%20%5E'%3Bconst descendingMark%3D'%20v'%3Bconst headerClass%3D'sortable-header'%3Bconst filterInputClass%3D'table-filter-input'%3Bconst stickyHeaderBackgroundColor%3D'%2314b8a6'%3Bconst stickyHeaderTextColor%3D'%23ffffff'%3Bfunction log(message)%7Bconsole.log(%60%5BTableEnhancer%5D%20%24%7Bmessage%7D%60)%7Dfunction warn(message)%7Bconsole.warn(%60%5BTableEnhancer%5D%20%24%7Bmessage%7D%60)%7Dfunction error(message%2Cerr)%7Bconsole.error(%60%5BTableEnhancer%5D%20%24%7Bmessage%7D%60%2Cerr%7C%7C'')%7Dfunction getCellText(td)%7Breturn td%3F(td.textContent%7C%7Ctd.innerText%7C%7C''):''%7Dfunction sortTableByColumn(table%2CcolIndex%2Cascending%2CtableIndex)%7Bif(!table.tBodies%7C%7Ctable.tBodies.length%3D%3D%3D0)%7Bwarn(%60Table %24%7BtableIndex%7D%3A No tbody found%2C skipping sort.%60)%3Breturn%7Dconst tbody%3Dtable.tBodies%5B0%5D%3Bif(tbody.rows.length<2)%7Blog(%60Table %24%7BtableIndex%7D%3A tbody has less than 2 rows%2C skipping sort.%60)%3Breturn%7Dconst allRows%3DArray.from(tbody.rows)%3Blet headerRowInTbody%3Dnull%3Blet dataRows%3DallRows%3Bconst potentialHeaderRow%3DallRows%5B0%5D%3Bconst headerCells%3DgetTableHeaderCells(table%2CtableIndex%2Ctrue)%3Bif(headerCells.includes(potentialHeaderRow.cells%5B0%5D))%7Bif(headerCells%5B0%5D%26%26headerCells%5B0%5D.parentNode%3D%3D%3DpotentialHeaderRow)%7Blog(%60Table %24%7BtableIndex%7D%3A Header row identified within tbody. Excluding from sort.%60)%3BheaderRowInTbody%3DpotentialHeaderRow%3BdataRows%3DallRows.slice(1)%7D%7Dif(dataRows.length%3D%3D%3D0)%7Blog(%60Table %24%7BtableIndex%7D%3A No data rows to sort after excluding header.%60)%3Breturn%7Dconst direction%3Dascending%3F1%3A-1%3BdataRows.sort((rowA%2CrowB)%3D>%7Bconst cellA%3DrowA.cells%26%26rowA.cells.length>colIndex%3FrowA.cells%5BcolIndex%5D:null%3Bconst cellB%3DrowB.cells%26%26rowB.cells.length>colIndex%3FrowB.cells%5BcolIndex%5D:null%3Bif(!cellA%7C%7C!cellB)return 0%3Bconst textA%3DgetCellText(cellA).trim().toLowerCase()%3Bconst textB%3DgetCellText(cellB).trim().toLowerCase()%3Bconst numA%3DparseFloat(textA)%3Bconst numB%3DparseFloat(textB)%3Bif(!isNaN(numA)%26%26!isNaN(numB))%7Bif(numA<numB)return -1*direction%3Bif(numA>numB)return 1*direction%3Breturn 0%7Delse%7Bif(textA<textB)return -1*direction%3Bif(textA>textB)return 1*direction%3Breturn 0%7D%7D)%3Bwhile(tbody.firstChild)%7Btbody.removeChild(tbody.firstChild)%7Dif(headerRowInTbody)%7Btbody.appendChild(headerRowInTbody)%7DdataRows.forEach(row%3D>tbody.appendChild(row))%3Blog(%60Table %24%7BtableIndex%7D%3A Sorting complete. Updating indicators.%60)%3BupdateSortIndicators(table%2CcolIndex%2Cascending%2CtableIndex)%7Dfunction updateSortIndicators(table%2CsortedColIndex%2Cascending%2CtableIndex)%7Bconst headerCells%3DgetTableHeaderCells(table%2CtableIndex%2Ctrue)%3Bif(!headerCells%7C%7CheaderCells.length%3D%3D%3D0)return%3BheaderCells.forEach((th%2Cindex)%3D>%7Bif(!th)return%3Blet currentText%3DgetCellText(th).replace(ascendingMark%2C'').replace(descendingMark%2C'').trim()%3Bth.style.cursor%3D'pointer'%3BObject.assign(th.style%2C%7Bposition:'sticky'%2Ctop:'0'%2CbackgroundColor:stickyHeaderBackgroundColor%2Ccolor:stickyHeaderTextColor%2CzIndex:'1'%2Cpadding:'10px 15px'%2CtextAlign:'left'%7D)%3Bth.title%3D'Click to sort'%3Bif(index%3D%3D%3DsortedColIndex)%7BcurrentText+%3Dascending%3FascendingMark%3AdescendingMark%3Bth.dataset.sortDirection%3Dascending%3F'asc'%3A'desc'%3Bth.title%3D%60Sorted %24%7Bascending%3F'ascending'%3A'descending'%7D. Click to reverse.%60%7Delse%7Bdelete th.dataset.sortDirection%7Dth.textContent%3DcurrentText%7D)%7Dfunction filterTable(input%2Ctable%2CtableIndex)%7Bif(!table.tBodies%7C%7Ctable.tBodies.length%3D%3D%3D0)%7Bwarn(%60Table %24%7BtableIndex%7D%3A No tbody found%2C skipping filter.%60)%3Breturn%7Dconst tbody%3Dtable.tBodies%5B0%5D%3Bconst filterText%3Dinput.value.toLowerCase().trim()%3Bconst allRows%3DArray.from(tbody.rows)%3Blet headerRowInTbody%3Dnull%3Bconst headerCells%3DgetTableHeaderCells(table%2CtableIndex%2Ctrue)%3Bif(allRows.length>0)%7Bconst potentialHeaderRow%3DallRows%5B0%5D%3Bif(headerCells.includes(potentialHeaderRow.cells%5B0%5D)%26%26headerCells%5B0%5D.parentNode%3D%3D%3DpotentialHeaderRow)%7BheaderRowInTbody%3DpotentialHeaderRow%7D%7DArray.from(tbody.rows).forEach(row%3D>%7Bif(!row)return%3Bif(row%3D%3D%3DheaderRowInTbody)%7Brow.style.display%3D''%3Breturn%7Dlet match%3Dfalse%3Bif(!filterText)%7Bmatch%3Dtrue%7Delse%7Bif(row.cells%26%26typeof row.cells%5BSymbol.iterator%5D%3D%3D%3D'function')%7BArray.from(row.cells).forEach(cell%3D>%7Bif(getCellText(cell).toLowerCase().includes(filterText))%7Bmatch%3Dtrue%7D%7D)%7D%7Drow.style.display%3Dmatch%3F''%3A'none'%7D)%7Dfunction getTableHeaderCells(table%2CtableIndex%2Csilent%3Dfalse)%7Bconst thead%3Dtable.tHead%3Bif(thead%26%26thead.rows.length>0)%7Bif(!silent)log(%60Table %24%7BtableIndex%7D%3A Found header via thead.%60)%3Breturn Array.from(thead.rows%5Bthead.rows.length-1%5D.cells)%7Delse if(table.rows%26%26table.rows.length>0)%7Bif(!silent)log(%60Table %24%7BtableIndex%7D%3A No thead found. Assuming first row is header.%60)%3Breturn Array.from(table.rows%5B0%5D.cells)%7Dif(!silent)warn(%60Table %24%7BtableIndex%7D%3A Could not find any rows to determine header.%60)%3Breturn%5B%5D%7Dlog('Bookmarklet (v5) Activated')%3Bconst tables%3Ddocument.querySelectorAll('table')%3Bif(tables.length%3D%3D%3D0)%7Blog('No tables found on this page.')%3Breturn%7Dlog(%60Found %24%7Btables.length%7D table(s). Processing...%60)%3Btables.forEach((table%2CtableIndex)%3D>%7Bconst currentTableIndex%3DtableIndex+1%3Btry%7Blog(%60Processing Table %24%7BcurrentTableIndex%7D (ID%3A %24%7Btable.id%7C%7C'none'%7D)%60)%3Bconst filterInput%3Ddocument.createElement('input')%3BfilterInput.type%3D'search'%3BfilterInput.placeholder%3DfilterInputPlaceholder%3BfilterInput.classList.add(filterInputClass)%3BObject.assign(filterInput.style%2C%7BmarginBottom:'15px'%2Cpadding:'10px 15px'%2Cborder:'1px solid %23d1d5db'%2CborderRadius:'6px'%2CfontSize:'1rem'%2Cwidth:'100%25'%2CmaxWidth:'500px'%2Cdisplay:'block'%2CboxSizing:'border-box'%7D)%3BfilterInput.setAttribute('aria-label'%2C%60Filter table %24%7BcurrentTableIndex%7D%60)%3BfilterInput.setAttribute('enterkeyhint'%2C'search')%3BfilterInput.addEventListener('input'%2C()%3D>%7Btry%7BfilterTable(filterInput%2Ctable%2CcurrentTableIndex)%7Dcatch(filterErr)%7Berror(%60Error during filtering Table %24%7BcurrentTableIndex%7D%60%2CfilterErr)%7D%7D)%3Bif(table.parentNode)%7Btable.parentNode.insertBefore(filterInput%2Ctable)%3Blog(%60Table %24%7BcurrentTableIndex%7D%3A Filter input added.%60)%7Delse%7Bwarn(%60Table %24%7BcurrentTableIndex%7D%3A Could not find parent node to insert filter.%60)%7Dconst headerCells%3DgetTableHeaderCells(table%2CcurrentTableIndex)%3Bif(headerCells.length%3D%3D%3D0)%7Bwarn(%60Table %24%7BcurrentTableIndex%7D%3A No header cells identified. Skipping sort%2Fsticky features.%60)%7Delse%7Blog(%60Table %24%7BcurrentTableIndex%7D%3A Found %24%7BheaderCells.length%7D header cells. Applying features...%60)%3BheaderCells.forEach((th%2CcolIndex)%3D>%7Bif(!th)%7Bwarn(%60Table %24%7BcurrentTableIndex%7D%3A Header cell at index %24%7BcolIndex%7D is null%2Fundefined. Skipping.%60)%3Breturn%7Dth.classList.add(headerClass)%3BObject.assign(th.style%2C%7Bposition:'sticky'%2Ctop:'0'%2CbackgroundColor:stickyHeaderBackgroundColor%2Ccolor:stickyHeaderTextColor%2CzIndex:'1'%2Cpadding:'10px 15px'%2CtextAlign:'left'%2Ccursor:'pointer'%7D)%3Bth.title%3D'Click to sort'%3Bth.addEventListener('click'%2C()%3D>%7Blog(%60Table %24%7BcurrentTableIndex%7D%3A Clicked header index %24%7BcolIndex%7D. Attempting sort.%60)%3Btry%7Bconst currentDirection%3Dth.dataset.sortDirection%3Bconst ascending%3DcurrentDirection!%3D%3D'asc'%3BsortTableByColumn(table%2CcolIndex%2Cascending%2CcurrentTableIndex)%7Dcatch(sortErr)%7Berror(%60Error during sorting Table %24%7BcurrentTableIndex%7D%2C Column %24%7BcolIndex%7D%60%2CsortErr)%7D%7D)%3Blog(%60Table %24%7BcurrentTableIndex%7D%3A Listener added to header cell %24%7BcolIndex%7D.%60)%7D)%3BupdateSortIndicators(table%2C-1%2Ctrue%2CcurrentTableIndex)%3Blog(%60Table %24%7BcurrentTableIndex%7D%3A Header processing complete.%60)%7D%7Dcatch(tableErr)%7Berror(%60Error processing Table %24%7BcurrentTableIndex%7D%60%2CtableErr)%7D%7D)%3Blog('Bookmarklet setup finished.')%7D)()%3B
        ```

4.  **Save:** Save the new bookmark.

**Method 2: Drag and Drop (Works in some browsers like Firefox)**

1.  Make sure your bookmarks bar is visible.
2.  Select the entire code snippet above (starting with `javascript:`).
3.  Drag the selected text directly onto your bookmarks bar. A new bookmark should be created. You might need to rename it afterward.

## How to Use

1.  **Navigate:** Go to a webpage containing one or more standard HTML tables.
2.  **Click Bookmarklet:** Click the "Enhance Table" (or whatever you named it) bookmarklet in your bookmarks bar.
3.  **Interact:**
      * **Filter:** A "Search table..." input will appear above each table. Type in it to instantly filter rows. The filter checks text across all columns in a row. Clear the input to show all rows.
      * **Sort:** Click on any column header. The table will sort by that column's content (ascending first). Click the same header again to sort descending. A `^` or `v` indicates the current sort column and direction.

## Limitations

  * **Sticky Header:** The sticky header feature relies on CSS `position: sticky`. This may not work correctly on all websites, especially if the table is inside elements with specific `overflow` CSS properties (like `overflow: hidden` or `overflow: auto`).
  * **Complex Tables:** May not work perfectly on tables with very complex structures (e.g., merged header cells spanning multiple rows/columns - `rowspan`/`colspan`), or tables generated dynamically by heavy JavaScript frameworks after the page initially loads.
  * **Performance:** Sorting very large tables might take a moment.
  * **Temporary:** Enhancements only apply to the current page view and are reset upon reloading the page.

## Credits

This bookmarklet was developed iteratively using Google's Gemini (2.5 Pro) model.

## License

[MIT License](https://opensource.org/licenses/MIT).

