const upIcon = "fa-solid fa-caret-up";
const downIcon = "fa-solid fa-caret-down";

let columnNames;
let tbody;
let tfootRow;
let indexToSortFrom = 0;
let baseRowCopy;

let currentModifyRow;
let modifiedRowOldValues;

window.onload = main;

function changeClicked(event) {
    let row = event.currentTarget.closest("tr");
    modifiedRowOldValues = [];
    let rowModifiableColumns = row.querySelectorAll("th input");
    rowModifiableColumns.forEach(modifiableColumn => {
        modifiedRowOldValues.push(modifiableColumn.value);
    });
    cancelRowModify(row);
}

function cancelClicked(event) {
    let row = event.currentTarget.closest("tr");
    currentModifyRow = undefined;
    cancelRowModify(row);
}

function cancelRowModify(row) {
    let modifyButton = row.querySelector("th .modify-button");
    let modifyRowContainer = row.querySelector("th .row-edit-container");
    modifyButton.className = modifyButton.className.split(" ")[0];
    modifyRowContainer.className += " hidden";

    let rowModifiableColumns = row.querySelectorAll("th input");
    for (let i = 0; i < rowModifiableColumns.length; i++)
    {
        let modifiableColumn = rowModifiableColumns[i];
        modifiableColumn.className = "no-show";
        modifiableColumn.setAttribute("readonly", "");
        modifiableColumn.value = modifiedRowOldValues[i];
    }

    modifiedRowOldValues = [];
    currentModifyRow = undefined;
}

function removeClicked(event) {
    let row = event.currentTarget.closest("tr");
    tbody.removeChild(row);
    getNewID();
}

function modifyClicked(event) {
    let row = event.currentTarget.parentNode;
    if (currentModifyRow === undefined)
    {
        currentModifyRow = row.parentNode;
    }
    else if (currentModifyRow !== row.parentNode) {
        cancelRowModify(currentModifyRow);
        currentModifyRow = row.parentNode;
    }
    event.currentTarget.className += " hidden";
    let modifyRowContainer = row.querySelector(".row-edit-container");
    modifyRowContainer.className = modifyRowContainer.className.split(" ")[0];

    let rowModifiableColumns = row.parentNode.querySelectorAll("th input");
    rowModifiableColumns.forEach(modifiableColumn => {
        modifiedRowOldValues.push(modifiableColumn.value);
        modifiableColumn.className = "";
        modifiableColumn.removeAttribute("readonly");
    })
}

function main()
{
    columnNames = document.querySelectorAll("table thead tr .column-name-button");
    columnNames.forEach(btn => btn.addEventListener("click", clickedColumn, false));

    tbody = document.querySelector("table tbody");
    baseRowCopy = tbody.rows[0].cloneNode(true);
    tfootRow = document.querySelector("table tfoot").children[0].children;

    getNewID();

    document.querySelectorAll("table tbody tr th .modify-button").forEach(btn => addRowEditorListeners(btn.parentNode));

    document.querySelector("#add-button").addEventListener("click", clickedAdd, false);

    currentModifyRow = undefined;
    modifiedRowOldValues = [];
}

function addRowEditorListeners(element)
{
    element.querySelector(".modify-button").addEventListener("click", modifyClicked, false);
    element.querySelector(".row-edit-container .change-button").addEventListener("click", changeClicked, false);
    element.querySelector(".row-edit-container .cancel-button").addEventListener("click", cancelClicked, false);
    element.querySelector(".row-edit-container .remove-button").addEventListener("click", removeClicked, false);
}

function clickedColumn(event)
{
    let element = event.currentTarget;

    // Set each icon of other columns to hidden and keep index to sort from
    for (let i = 0; i < columnNames.length; i++)
    {
        if (columnNames[i] !== element)
        {
            columnNames[i].children[0].className = "hidden";
        }
        else
        {
            indexToSortFrom = i;
        }
    }

    switch (element.children[0].className)
    {
        case downIcon :
            element.children[0].className = upIcon;
            break;
        default :
            element.children[0].className = downIcon;
            break;
    }

    sortRows();
}

function sortRows()
{
    let columnBodyRows = Array.from(tbody.rows);

    switch (columnNames[indexToSortFrom].children[0].className)
    {
        case upIcon:
            columnBodyRows.sort((a, b) => {
                let element1 = a.children[indexToSortFrom].innerHTML;
                let element2 = b.children[indexToSortFrom].innerHTML;
                if (isNaN(element1))
                {
                    element1 = a.children[indexToSortFrom].children[0].value;
                    element2 = b.children[indexToSortFrom].children[0].value;
                    return element2.localeCompare(element1);
                }
                else
                {
                    return element2 - element1;
                }
            });
            break;
        case downIcon:
            columnBodyRows.sort((a, b) => {
                let element1 = a.children[indexToSortFrom].innerHTML;
                let element2 = b.children[indexToSortFrom].innerHTML;
                if (isNaN(element1))
                {
                    element1 = a.children[indexToSortFrom].children[0].value;
                    element2 = b.children[indexToSortFrom].children[0].value;
                    return element1.localeCompare(element2);
                }
                else
                {
                    return element1 - element2;
                }
            });
            break;
    }

    //Clear current tbody rows
    while (tbody.firstChild)
    {
        tbody.removeChild(tbody.lastChild);
    }

    //Add sorted rows
    for (let i = 0; i < columnBodyRows.length; i++)
    {
        tbody.appendChild(columnBodyRows[i]);
    }
}

function clickedAdd() {
    let newRow = baseRowCopy.cloneNode(true);

    newRow.children[0].innerText = tfootRow[0].innerText;
    for (let i = 1; i < tfootRow.length - 1; i++)
    {
        let value = tfootRow[i].children[0].value;
        if (value.length === 0)
        {
            value = tfootRow[i].children[0].getAttribute("placeholder");
        }
        newRow.children[i].innerText = value;
        tfootRow[i].children[0].value = "";
    }

    tbody.appendChild(newRow);

    addRowEditorListeners(newRow);
    sortRows();
    getNewID();
}

function getNewID() {
    let bodyRows = Array.from(tbody.rows);
    let ids = [];
    bodyRows.forEach(row => {
        ids.push(parseInt(row.children[0].innerText));
    });

    // Gets next empty id
    ids.sort((a, b) => a - b);
    let newId = -1;
    if (ids[0] !== 1)
    {
        newId = 1;
    }
    else
    {
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
        newId = ids[ids.length - 1] + 1;
    }

    tfootRow[0].innerText = newId;
}