function generateRows(table, data) {
  resetTable(table)
  const tbody = table.querySelector('tbody')
  const titles = getTitles(table)
  data.forEach((row, index) => {
    const newRow = document.createElement('tr')
    const childRow = document.createElement('tr')
    const childRowTd = document.createElement('td')
    const ul = document.createElement('ul') 
    const rowId = `table-ui-${index + 1}`
    newRow.classList.add('parent-row')
    childRow.classList.add('child-row')
    childRow.classList.add('hidden')
    childRow.setAttribute("id", rowId);
    childRowTd.setAttribute("colspan", row.length);

    row.forEach((td, i) => {
      if(i === 0) {
        const btn = document.createElement('span')
        btn.classList.add('btn-open-plus')
        btn.classList.add('hidden')
        btn.innerHTML = '+'
        btn.setAttribute('rowId', rowId)
        newRow.appendChild(createFirstTD(btn, td))
      } else {
        newRow.appendChild(createTD(td))
      }
      ul.appendChild(createLi(titles[i], td))
    })

    childRowTd.appendChild(ul)
    childRow.appendChild(childRowTd)

    tbody.appendChild(newRow)
    tbody.appendChild(childRow)

  })

  tbody.onclick = (e) => {
    const btn = e.target.classList.contains('btn-open-plus')
    if(btn) {
      setVisibleChild(e.target, e.target.getAttribute('rowId'))
    }
  }
}

function setVisibleChild(btn, rowId) {
  const row = document.getElementById(rowId)
  row.classList.toggle('hidden')
  btn.classList.toggle('btn-open-plus-red')
}

function createLi(title , content) {
  const template = document.createElement("li");
  template.innerHTML = `
    <strong>${title}</strong>
    ${content}
  `;

  template.classList.add('hidden')
  return template;
}

function getTitles(table) {
  const thead = table.querySelector('thead')
  const ths = thead.querySelectorAll('th')
  const obj = {}
  ths.forEach((th, i) => { 
    obj[i] = th.innerHTML
  })

  return obj
}

function createFirstTD(btn, content) {
  const template = document.createElement("td");
    template.appendChild(btn)
    template.innerHTML += content
    return template
}

function createTD(content) {
  const template = document.createElement("td");
    template.innerHTML = content
    return template
}

function createChildTD() {
  const template = document.createElement("td");
    template.innerHTML = `
    <ul>
      <li>
        <strong>${title}</strong>
        ${content}
      </li>
    </ul>`

    return template
}

function listenChanges(table) { 
  const parent = table.parentNode;
  if (parent) {
    let hasHorizontalScroll = parent.scrollWidth > parent.clientWidth;
    while(hasHorizontalScroll) {
      hideColumns(table)
      hasHorizontalScroll = parent.scrollWidth > parent.clientWidth; 
    }
  }
}

function resetTable(table) {
  const thead = table.querySelector('thead')
  const tbody = table.querySelector('tbody')
  const ths = thead.querySelectorAll('th')
  ths.forEach(th => {
    th.classList.remove('hidden')
  })
  tbody.innerHTML = ""
}

function hideColumns(table) {
  const thead = table.querySelector('thead')
  hideLastTH(thead)
  // Select tbody
  const tbody = table.querySelector('tbody')
  // Select all principals tr of tbody
  const trs = tbody.querySelectorAll('tr.parent-row') 
  hideLastTD(trs)
  // Select all secondary tr of tbody
  const tds = tbody.querySelectorAll('tr.child-row') 
  enableLastLi(tds)
}

function hideLastTH(tr) {
  const allVisible = tr.querySelectorAll('th:not(.hidden)')
  const lastIndex = allVisible.length - 1
  if(allVisible.length > 1) {
    const td = allVisible[lastIndex]
    td.classList.add('hidden')
  }
}

function enableLastLi(tds) { 
  tds.forEach((td, i) => {
    const ul = td.querySelectorAll('li.hidden')
    ul[ul.length - 1].classList.remove('hidden')
  })
} 

function hideLastTD(trs) { 
  trs.forEach(tr => {
    const allVisible = tr.querySelectorAll('td:not(.hidden)')
    allVisible[0].querySelector('span').classList.remove('hidden')
    if(allVisible.length > 1) {
      const lastIndex = allVisible.length - 1
      allVisible[lastIndex].classList.add('hidden')
    }
  })
} 

class TableUI {
  table;
  perPage = 5;
  pages = 1;
  currentPage = 1;
  btnNext = "Next";
  btnPreview = "Preview";
  data = [];
  constructor(tableId) {
    this.table = document.getElementById(tableId)
    this.table.classList.add('table-ui')
  }

  create(props) {
    this.data = props.data || []
    this.totalRows = props.totalRows || 0
    this.pagination = props.pagination || this.query
    generateRows(
      this.table, 
      this.pagination(
        this.perPage, 
        this.currentPage
    ))
    listenChanges(this.table);
    window.addEventListener("resize", () => {
      if(window.innerWidth > 200) {
        generateRows(
          this.table, 
          this.pagination(
            this.perPage, 
            this.currentPage
        ))
        listenChanges(this.table);
      }
    })
    this.pages = this.getTotalPages(this.perPage, this.totalRows)
    this.loadFooter()
    this.onInit()
  }

  setData(data, update=false) {
    if(update) {
      this.data = data
    }
    
    generateRows(this.table, data)
    listenChanges(this.table);
  }

  getTotalPages(perPage, total) {
    let round = total % perPage
    let pages = total / perPage
    const isMinor = total <= perPage
    if(isMinor) return 1
    if(round > 0) {
      pages = parseInt(pages) + 1
    }
    return pages
  }

  createBtnPages(pages, selected) {
    const pagination = document.createElement('div')
    const btnPreview = document.createElement('div')
    pagination.classList.add('pagination')
    btnPreview.classList.add('btn-preview')
    btnPreview.innerHTML = this.btnPreview
    pagination.appendChild(btnPreview)
    
    for(let i = 0; i < pages; i++) {
      const btnNumber = document.createElement('div')
      btnNumber.classList.add('btn-number')
      btnNumber.setAttribute('btnId', (i + 1))
      btnNumber.innerHTML = i + 1
      if((i + 1) === selected) {
        btnNumber.classList.add('page-selected')
      }
      pagination.appendChild(btnNumber)
    }
    const btnNext = document.createElement('div')
    btnNext.classList.add('btn-next')
    btnNext.innerHTML = this.btnNext
    pagination.appendChild(btnNext)

    return pagination
  }

  onInit() {
    this.tfooter.onclick = (e) => {
      let btn = e.target.classList
      // Detectamos sobre que boton se dió click
      if(btn.contains('btn-number')) {
        // Obtenemos el numero de pagina del boton
        const pageNumber = e.target.getAttribute('btnId')
        this.deactiveBtns()
        this.currentPage = parseInt(pageNumber)
        this.activateBtn()
      }

      if(btn.contains('btn-preview')) {
        this.getPrevPage()      
      }

      if(btn.contains('btn-next')) {
        this.getNextPage()      
      }
    }
  }

  getNextPage() {
    if(this.currentPage < this.pages) {
      this.currentPage++
      this.deactiveBtns()
      this.activateBtn()
    }
  }

  getPrevPage() {
    if(this.currentPage > 1) {
      this.currentPage--
      this.deactiveBtns()
      this.activateBtn()
    }
  }

  loadFooter() {
    let ths = this.table.querySelectorAll('th')
    this.tfooter = this.table.createTFoot();
    const row = this.tfooter.insertRow();
    const td = row.insertCell();
    const containerPager = document.createElement('div')
    containerPager.classList.add('td-div-pages')
    containerPager.appendChild(this.createBtnPages(this.pages, this.currentPage))
    td.classList.add('footer-ui')
    td.setAttribute('colspan', ths.length)
    td.appendChild(containerPager)
  }

  activateBtn() {
    let btns = this.tfooter.querySelectorAll('.btn-number')
    btns.forEach((btn, index)=> {
      if((index + 1) === this.currentPage) {
        btn.classList.add('page-selected')
      }
    })
    
    this.setData(this.pagination(this.perPage, this.currentPage))
  }

  deactiveBtns() {
    let btns = this.tfooter.querySelectorAll('.btn-number')
    btns.forEach(btn => {
      btn.classList.remove('page-selected')
    })
  }

  query(perPage, currentPage) {
    const init = (perPage * (currentPage - 1)) + 1
    const end = init + (perPage - 1)
    const toReturn = [...this.data].slice((init - 1), end)
    return toReturn
  }
}
