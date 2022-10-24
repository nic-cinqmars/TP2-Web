const upIcon = "fa-solid fa-caret-up";
const downIcon = "fa-solid fa-caret-down";

let columnNames;
let tbody;
let tfootRow;
let indexToSortFrom = 0;

window.onload = main;

function main()
{
    columnNames = document.querySelectorAll("table thead tr .column-name-button");
    columnNames.forEach(btn => btn.addEventListener("click", clickedColumn, false));

    tbody = document.querySelector("table tbody");
    tfootRow = document.querySelector("table tfoot").children[0].children;
    tfootRow[0].innerText = parseInt(tbody.lastElementChild.children[0].innerText) + 1;

    document.querySelector("#add-button").addEventListener("click", clickedAdd, false);
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
                let element1 = a.children[indexToSortFrom].innerText;
                let element2 = b.children[indexToSortFrom].innerText;
                if (isNaN(element1))
                {
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
                let element1 = a.children[indexToSortFrom].innerText;
                let element2 = b.children[indexToSortFrom].innerText;
                if (isNaN(element1))
                {
                    return element1.localeCompare(element2);
                }
                else
                {
                    return element1 - element2;
                }
            });
            break;
        default:
            console.debug("Error");
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
    let newRow = tbody.lastElementChild.cloneNode(true);
    console.debug(newRow);
    console.debug(tfootRow);

    newRow.children[0].innerText = tfootRow[0].innerText;
    for (let i = 1; i < tfootRow.length - 1; i++)
    {
        console.debug(tfootRow[i].value);
        newRow.children[i].innerText = tfootRow[i].children[0].value;
        tfootRow[i].children[0].value = "";
    }

    tbody.appendChild(newRow);
    sortRows();

    tfootRow[0].innerText = parseInt(tbody.lastElementChild.children[0].innerText) + 1;
}

function getNewID() {
    let columnBodyRows = Array.from(tbody.rows);
}