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

function loadFooter(table) {
  const ths = table.querySelectorAll('th')
  const tfooter = table.createTFoot();
  const row = tfooter.insertRow();
  ths.forEach(th => {
    row.appendChild(th.cloneNode(true))
  })
}

function createTopHeader(table, perPageOptions, perPageProps, searchProps) {
  const container = table.parentNode
  const section = document.createElement('div')
  section.classList.add('top-section')
  section.appendChild(generatePerPage(perPageOptions, perPageProps))
  section.appendChild(generateSearch(searchProps))
  container.insertBefore(section, table)
}

function generatePerPage(options, perPageProps) {
  const perPage = document.createElement('div')
  const spanLeft = document.createElement('span')
  const select = document.createElement('select')
  const spanRight = document.createElement('span')
  spanLeft.innerHTML = perPageProps.textLeft
  spanRight.innerHTML = perPageProps.textRight
  perPage.classList.add('per-page')

  select.onchange = perPageProps.change

  options.forEach(value => {
    const option = document.createElement('option')
    option.value = value 
    option.innerHTML = value 
    select.appendChild(option)
  })
  perPage.appendChild(spanLeft)
  perPage.appendChild(select)
  perPage.appendChild(spanRight)
  return perPage
}

function generateSearch(searchProps) {
  const search = document.createElement('div')
  const spanLeft = document.createElement('span')
  const input = document.createElement('input')
  input.oninput = searchProps.method
  input.setAttribute('placeholder', searchProps.placeholder)
  search.classList.add('search')
  spanLeft.innerHTML = searchProps.text
  search.appendChild(spanLeft)
  search.appendChild(input)
  return search
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
  if(!table.querySelector('tfoot')) loadFooter(table)
  const tfoot = table.querySelector('tfoot')
  const thead = table.querySelector('thead')
  const tbody = table.querySelector('tbody')
  const ths = thead.querySelectorAll('th')
  const thsFoot = tfoot.querySelectorAll('th')
  ths.forEach(th => {
    th.classList.remove('hidden')
  })

  thsFoot.forEach(td => {
    td.classList.remove('hidden')
  })

  ths.forEach(th => {
    th.classList.remove('hidden')
  })
  tbody.innerHTML = ""
}

function hideColumns(table) {
  const tbody = table.querySelector('tbody')
  const thead = table.querySelector('thead')
  hideLastTH(thead)
  // Select all principals tr of tbody
  const trs = tbody.querySelectorAll('tr.parent-row') 
  hideLastTD(trs)
  // Select all secondary tr of tbody
  const tds = tbody.querySelectorAll('tr.child-row') 
  enableLastLi(tds)
  // Select all td of tfoor
  const tfoot = table.querySelector('tfoot')
  hideLastTfootTD(tfoot)
}

function hideLastTH(tr) {
  const allVisible = tr.querySelectorAll('th:not(.hidden)')
  const lastIndex = allVisible.length - 1
  if(allVisible.length > 1) {
    const td = allVisible[lastIndex]
    td.classList.add('hidden')
  }
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

function enableLastLi(tds) { 
  tds.forEach((td) => {
    const ul = td.querySelectorAll('li.hidden')
    ul[ul.length - 1].classList.remove('hidden')
  })
} 

function hideLastTfootTD(tfoot) {
  const allVisible = tfoot.querySelectorAll('th:not(.hidden)')
  const lastIndex = allVisible.length - 1
  if(allVisible.length > 1) {
    const td = allVisible[lastIndex]
    td.classList.add('hidden')
  }
}

class TableUI {
  table;
  perPage = 5;
  pages = 1;
  currentPage = 1;
  btnNext = "Next";
  btnPreview = "Preview";
  data = [];
  backup = []
  wasFound = false
  perPageOptions = [5, 10, 15, 20, 50, 100]
  perPageProps= {
    textLeft: "Show",
    textRight: 'entries',
    change:  (e) => this.setPerPage(e)
  }

  searchProps = {
    text: "search:",
    placeholder: "",
    method: (e) => this.search(e)
  }

  constructor(tableId) {
    this.table = document.getElementById(tableId)
    this.table.classList.add('table-ui')
  }

  create(props) {
    this.data = props.data || []
    this.backup = props.data || []
    this.totalRows = props.totalRows || 0
    // Function that loads the data in the table
    this.pagination = props.pagination || this.query
    // Button options
    this.btnNext = props.btnNext || this.btnNext
    this.btnPreview = props.btnPreview || this.btnPreview
    // Load other props
    this.perPageProps = props.perPageProps ? {...this.perPageProps, ...props.perPageProps} : this.perPageProps
    this.searchProps = props.searchProps ? { ...this.searchProps, ...props.searchProps} : this.searchProps
    // Generate header top
    createTopHeader(
      this.table, 
      this.perPageOptions, 
      this.perPageProps,
      this.searchProps
    )
    // Create all rows in tbody
    generateRows(
      this.table, 
      this.pagination(
        this.perPage, 
        this.currentPage    
    ))
    // Init responsive actions 
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
    // Load pagination
    this.pages = this.getTotalPages(this.perPage, this.totalRows)
    // load buttons action
    this.loadPageButtons()
    this.onInit()
  }

  search(e) {
    const value = e.target.value
    this.data = this.backup
    this.data = this.filter(value)
    if(this.data.length > 0) {
      this.totalRows = this.data.length
      this.loadPerPage()
    } else {
      this.totalRows = this.data.length + 1
      this.loadPerPage(false)
      this.getEmptyRow()
    }
  }

  getEmptyRow() {
    const thead = this.table.querySelector('thead')
    const tbody = this.table.querySelector('tbody')
    const colspan = thead.querySelectorAll('th').length
    const row = tbody.insertRow()
    const td = row.insertCell()
    td.setAttribute("colspan", colspan)
    td.innerHTML = "Not results"
    row.classList.add('empty-row')
    tbody.appendChild(row)
  }

  filter(value) {
    const regex = new RegExp(`\\b.*${value.trim()}.*\\b`, "i");

    return this.data.filter(row => {
      if(row.filter(column => regex.test(column)).length > 0){
        return true
      } 
    })
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
    this.buttonsBlock.onclick = (e) => {
      let btn = e.target.classList
      if(btn.contains('btn-number')) {
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

  loadPageButtons() {
    if(this.buttonsBlock) this.buttonsBlock.remove()
    this.buttonsBlock = document.createElement('div')
    this.buttonsBlock.classList.add('td-div-pages')
    this.buttonsBlock.appendChild(this.createBtnPages(this.pages, this.currentPage)) 
    this.table.parentNode.appendChild(this.buttonsBlock)
  }

  activateBtn() {
    let btns = this.buttonsBlock.querySelectorAll('.btn-number')
    btns.forEach((btn, index)=> {
      if((index + 1) === this.currentPage) {
        btn.classList.add('page-selected')
      }
    })
    
    this.setData(this.pagination(this.perPage, this.currentPage))
  }
  
  setPerPage(e) {
    this.perPage = parseInt(e.target.value)
    this.currentPage = 1
    this.pages = this.getTotalPages(this.perPage, this.totalRows)
    this.setData(this.pagination(this.perPage, this.currentPage))
    this.loadPageButtons()
    this.onInit()
  }

  loadPerPage(activate = true) {
    this.currentPage = 1
    this.pages = this.getTotalPages(this.perPage, this.totalRows)
    this.setData(this.pagination(this.perPage, this.currentPage))
    this.loadPageButtons()
    if(activate) this.onInit()
  }

  deactiveBtns() {
    let btns = this.buttonsBlock.querySelectorAll('.btn-number')
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
