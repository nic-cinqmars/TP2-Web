const upIcon = "fa-solid fa-caret-up";
const downIcon = "fa-solid fa-caret-down";

let maxRowsPerPage = 20;
let currentPage = 0;

let theadCells;
let tfootCells;

let defaultRow;

let columnIndexToSortFrom = 0;

let currentModifyRow;
let modifiedRowOldValues;

window.onload = initialize;

function initialize()
{
    // Head of table cells
    theadCells = document.querySelectorAll("table thead tr .column-name-button");
    theadCells.forEach(btn => btn.addEventListener("click", theadCellClicked, false));

    let initialTbody = document.querySelector("table tbody");

    // Create a copy of first row which will be used when adding new rows
    defaultRow = initialTbody.rows[0].cloneNode(true);
    defaultRow.querySelector("th").innerText = "-1";
    defaultRow.querySelectorAll("th label input").forEach(input => input.value = 0);

    // Foot of table cells
    tfootCells = document.querySelector("table tfoot tr").children;

    // Fill ids
    let id = 1;
    initialTbody.querySelectorAll("tr").forEach(row => {
        row.children[0].innerText = id;
        id++;
    })

    // Set next id for new row
    setNewRowID();

    document.querySelectorAll("table tbody tr th .modify-button").forEach(btn => addRowEditorListeners(btn.parentNode));

    document.getElementById("add-button").addEventListener("click", addBtnClicked, false);

    document.getElementById("next-page-button").addEventListener("click", nextPageBtnClicked, false);

    let previousPageBtn = document.getElementById("previous-page-button");
    previousPageBtn.addEventListener("click", previousPageBtnClicked, false);
    previousPageBtn.className = "hidden";

    document.getElementById("rows-per-page-input").addEventListener("keydown", e => e.preventDefault(), false);
    document.getElementById("rows-per-page-input").addEventListener("change", rowsPerPageChange, false);

    createPages(Array.from(initialTbody.rows));

    currentModifyRow = undefined;
    modifiedRowOldValues = [];
}

function addRowEditorListeners(element)
{
    element.querySelector(".modify-button").addEventListener("click", modifyBtnClicked, false);
    element.querySelector(".row-edit-container .change-button").addEventListener("click", validateBtnClicked, false);
    element.querySelector(".row-edit-container .cancel-button").addEventListener("click", cancelBtnClicked, false);
    element.querySelector(".row-edit-container .remove-button").addEventListener("click", removeBtnClicked, false);
}

function getTbodies()
{
    return document.querySelectorAll("table tbody");
}

function getBodyRows()
{
    let tableTbodies = getTbodies();
    let bodyRows = [];
    tableTbodies.forEach(tbody => bodyRows = bodyRows.concat(Array.from(tbody.rows)))
    return bodyRows;
}

function getNumPages()
{
    return getTbodies().length;
}

// Splits all rows into different tbodies depending on maxRowsPerPage
function createPages(bodyRows)
{
    let tbodies = [];
    let currentTbody;
    for (let i = 0; i < bodyRows.length; i++)
    {
        if (i % maxRowsPerPage === 0)
        {
            let pageNumber = i / maxRowsPerPage;
            currentTbody = document.createElement("tbody");
            currentTbody.id = "page-" + pageNumber;
            tbodies.push(currentTbody)
        }
        currentTbody.appendChild(bodyRows[i]);
    }

    let table = document.querySelector("table");
    let tableTbodies = document.querySelectorAll("table tbody");
    tableTbodies.forEach(tbody => table.removeChild(tbody));
    tbodies.forEach(tbody => table.appendChild(tbody));
    switchPages();
}

function switchPages()
{
    // Hides or unhides page next and previous buttons
    if (getNumPages() > 1)
    {
        if (currentPage >= getNumPages() - 1)
        {
            document.getElementById("next-page-button").className = "hidden";
        }
        if (currentPage < getNumPages() - 1)
        {
            document.getElementById("next-page-button").className = "";
        }

        if (currentPage > 0)
        {
            document.getElementById("previous-page-button").className = "";
        }
        if (currentPage <= 0)
        {
            document.getElementById("previous-page-button").className = "hidden";
        }
    }
    else
    {
        // If only one page, hide both
        document.getElementById("next-page-button").className = "hidden";
        document.getElementById("previous-page-button").className = "hidden";
    }


    // Adjust current page if it is different from what it should be
    if (currentPage > getNumPages() - 1)
    {
        currentPage--;
    }
    else if (currentPage < 0)
    {
        currentPage++;
    }

    // Change page # text
    let pageNumber = currentPage + 1;
    document.getElementById("page-number-text").innerText = "Page " + pageNumber + " of " + getNumPages();

    // Hide or show tbodies if they are on the page we currently on
    let tbodies = getTbodies();
    for (let i = 0; i < tbodies.length; i++)
    {
        if (i === currentPage)
        {
            tbodies[i].className = "";
        }
        else
        {
            tbodies[i].className = "hidden";
        }
    }
}

function rowsPerPageChange(event)
{
    maxRowsPerPage = event.currentTarget.value;
    createPages(getBodyRows());
}

function modifyBtnClicked(event) {
    let row = event.currentTarget.parentNode;
    if (currentModifyRow === undefined)
    {
        currentModifyRow = row.parentNode;
    }
    else if (currentModifyRow !== row.parentNode) {
        // Only allow one row to be modified at a time
        cancelRowModify(currentModifyRow);
        currentModifyRow = row.parentNode;
    }

    // Hide modify button from being displayed
    event.currentTarget.className += " hidden";

    // Display row edit buttons
    let modifyRowContainer = row.querySelector(".row-edit-container");
    modifyRowContainer.className = modifyRowContainer.className.split(" ")[0];

    // Show inputs from row and allow to modify them
    let rowModifiableColumns = row.parentNode.querySelectorAll("th input");
    rowModifiableColumns.forEach(modifiableColumn => {
        modifiedRowOldValues.push(modifiableColumn.value);
        modifiableColumn.className = "";
        modifiableColumn.removeAttribute("readonly");
    })
}

function validateBtnClicked(event) {
    let row = event.currentTarget.closest("tr");

    // Set old values to current values to preserve them when cancelRowModify is called
    modifiedRowOldValues = [];
    let rowModifiableColumns = row.querySelectorAll("th input");
    rowModifiableColumns.forEach(modifiableColumn => {
        modifiedRowOldValues.push(modifiableColumn.value);
    });
    cancelRowModify(row);

    // Sort row with new values
    sortRows();
}

function cancelBtnClicked(event) {
    let row = event.currentTarget.closest("tr");
    cancelRowModify(row);
}

function cancelRowModify(row) {
    // Show modify button
    let modifyButton = row.querySelector("th .modify-button");
    modifyButton.className = modifyButton.className.split(" ")[0];

    // Hide row edit buttons
    let modifyRowContainer = row.querySelector("th .row-edit-container");
    modifyRowContainer.className += " hidden";

    // Hide inputs and set text to old row values
    let rowModifiableColumns = row.querySelectorAll("th input");
    for (let i = 0; i < rowModifiableColumns.length; i++)
    {
        let modifiableColumn = rowModifiableColumns[i];
        modifiableColumn.className = "no-show";
        modifiableColumn.setAttribute("readonly", "");
        modifiableColumn.value = modifiedRowOldValues[i];
    }

    // Clear variables
    modifiedRowOldValues = [];
    currentModifyRow = undefined;
}

function removeBtnClicked(event) {
    let row = event.currentTarget.closest("tr");
    let tbody = event.currentTarget.closest("tbody");
    tbody.removeChild(row);

    createPages(getBodyRows());

    // Set next id for new row as ids have changed
    setNewRowID();
}

function addBtnClicked() {
    // Create copy of defaultRow
    let newRow = defaultRow.cloneNode(true);

    // Set each value to corresponding values in tfoot columns
    newRow.children[0].innerText = tfootCells[0].innerText;
    for (let i = 1; i < tfootCells.length - 1; i++)
    {
        let value = tfootCells[i].querySelector("th label input").value;
        if (value.length === 0)
        {
            // If value is not set in input, set it to placeholder value
            value = tfootCells[i].querySelector("th label input").getAttribute("placeholder");
        }
        newRow.children[i].querySelector("label input").value = value;

        // Clear value from tfoot input
        tfootCells[i].children[0].value = "";
    }

    // For case when 0 pages exist
    if (getNumPages() > 0)
    {
        getTbodies()[0].appendChild(newRow);

        // Add listeners to new row
        addRowEditorListeners(newRow);

        // Sort row to place it at the correct location in table
        sortRows();
    }
    else
    {
        let row = [newRow];
        createPages(row);
    }

    // Set next id for new row
    setNewRowID();
}

function nextPageBtnClicked()
{
    currentPage += 1;
    switchPages();
    location.href = "#table-container";
}

function previousPageBtnClicked()
{
    currentPage -= 1;
    switchPages();
    location.href = "#table-container";
}


function theadCellClicked(event)
{
    let element = event.currentTarget;

    // Set each icon of other columns to hidden and keep index to sort from
    for (let i = 0; i < theadCells.length; i++)
    {
        if (theadCells[i] !== element)
        {
            theadCells[i].children[0].className = "hidden";
        }
        else
        {
            columnIndexToSortFrom = i;
        }
    }

    switch (element.children[0].className)
    {
        case upIcon :
            element.children[0].className = downIcon;
            break;
        default :
            element.children[0].className = upIcon;
            break;
    }

    sortRows();
}

function sortRows()
{
    let columnBodyRows = getBodyRows();
    console.debug(columnBodyRows);

    switch (theadCells[columnIndexToSortFrom].children[0].className)
    {
        // Sort descending
        case downIcon:
            columnBodyRows.sort((a, b) => {
                let element1 = a.children[columnIndexToSortFrom].innerHTML;
                let element2 = b.children[columnIndexToSortFrom].innerHTML;
                // Check if it is a number (if column 0)
                if (isNaN(element1))
                {
                    element1 = a.children[columnIndexToSortFrom].querySelector("label input").value;
                    element2 = b.children[columnIndexToSortFrom].querySelector("label input").value;
                    // Check if value is a number (column 2)
                    if (isNaN(element1))
                    {
                        // We know value is a string so compare accordingly
                        return element2.localeCompare(element1);
                    }
                }
                // Value is a number so compare accordingly
                return element2 - element1;
            });
            break;
        // Sort ascending
        case upIcon:
            columnBodyRows.sort((a, b) => {
                let element1 = a.children[columnIndexToSortFrom].innerHTML;
                let element2 = b.children[columnIndexToSortFrom].innerHTML;
                if (isNaN(element1))
                {
                    element1 = a.children[columnIndexToSortFrom].querySelector("label input").value;
                    element2 = b.children[columnIndexToSortFrom].querySelector("label input").value;
                    if (isNaN(element1))
                    {
                        return element1.localeCompare(element2);
                    }
                }
                return element1 - element2;
            });
            break;
    }

    createPages(columnBodyRows);
}

// Sets the lowest available id to tfoot id column
function setNewRowID() {
    let bodyRows = getBodyRows();
    let ids = [];
    bodyRows.forEach(row => {
        ids.push(parseInt(row.children[0].innerText));
    });

    ids.sort((a, b) => a - b);
    let newId = -1;
    if (ids[0] !== 1)
    {
        // id #1 is available so set it to that
        newId = 1;
    }
    else
    {
        // Checks if an id is available between two ids
        for (let i = 1; i < ids.length - 1; i++)
        {
            if (ids[i] - ids[i-1] > 1)
            {
                newId = ids[i-1] + 1;
                break;
            }
        }
    }
    if (newId === -1)
    {
        // No ids below last id available so get the next one instead
        newId = ids[ids.length - 1] + 1;
    }

    tfootCells[0].innerText = newId;
}