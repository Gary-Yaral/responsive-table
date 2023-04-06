let biggest = 0;
let offSets = {};
let thArray = [];
let rows = {};
let previousWidth;
let initialData = [[]]


function globalUI(table, tbody) {
  let thead = table.querySelector("thead");
  let trThead = thead.querySelector("tr");
  let container = table.parentNode;
  
  initialData = [[]]
  biggest = 0;
  offSets = {};
  thArray = [];
  rows = {};
  previousWidth = container.offsetWidth;
  
  getOffSets()
  loadedTable();
  
  function getOffSets() {
    let ths = trThead.querySelectorAll("th");
    ths.forEach((th, i) => {
      initialData[0].push(th)
      offSets[i] = th.offsetWidth;
    });
  
    biggest = Object.values(offSets).sort((a, b) => b - a)[0]
  }

  function loadedTable() {
    renderize();
    let ths = trThead.querySelectorAll("th");

    while (isBigger(ths)) {
      renderize();
      ths = trThead.querySelectorAll("th");
    }
  }

  function renderize() {
    let ths = thead.querySelectorAll("th");
    let trs = tbody.querySelectorAll("tr");
    let containerWidth = container.offsetWidth;

    if (isBigger(ths) && ths.length > 0) {
      hideColumns(ths, trs);
    } else {
      const hasRows = Object.keys(rows).length > 0;
      const hasThs = thArray.length > 0;
      const canShow = hasRows && hasThs && isExpanding();

      if (canShow) {
        showColumns(thArray, containerWidth, trs, ths);
      }
    }
  }

  function hideColumns(ths, trs) {
    let lastTh = ths[ths.length - 1];
    thArray.push({ th: lastTh });
    const hasNewRows = Object.keys(rows).length > 0;

    if (!hasNewRows) {
      for (let i = 0; i < trs.length; i++) {
        let tr = trs[i];
        let tds = tr.querySelectorAll("td");
        let lastIndex = tds.length - 1;
        let lastTd = tds[lastIndex];
        let content = lastTd.innerHTML;
        let colspan = ths.length - 1;

        if (!rows[i]) {
          rows[i] = [lastTd];
          let newRow = tbody.insertRow(i * 2 + 1);
          newRow.classList.add("tr-new");
          newRow.classList.add("hidden");
          newRow.appendChild(templateTD(lastTh.innerHTML, content, colspan));
          tds[0].querySelector("span").classList.remove("hidden");
        } else {
          rows[i].push(lastTd);
        }

        lastTd.remove();
      }
    }

    if (hasNewRows) {
      for (let i = 0; i < trs.length; i += 2) {
        let tr = trs[i];
        let tds = tr.querySelectorAll("td");
        let lastIndex = tds.length - 1;
        let lastTd = tds[lastIndex];
        let content = lastTd.innerHTML;
        let li = templateLi(lastTh.innerHTML, content);
        let loadedTd = trs[i + 1].querySelector("td");
        let ul = loadedTd.querySelector("ul");
        ul.insertBefore(li, ul.firstChild);
        rows[i / 2].push(lastTd);
        lastTd.remove();
      }
    }

    lastTh.remove();
  }

  function showColumns(thArray, containerWidth, trs, ths) {
    let lastColumn = thArray[thArray.length - 1];
    let widthTds = biggest;
    for (let i = 0; i <= ths.length; i++) {
      widthTds += offSets[i];
    } 

    if (containerWidth > widthTds) {
      for (let i = 0; i < trs.length; i += 2) {
        let tr = trs[i];
        let lastSaved = rows[i / 2].length - 1;
        tr.append(rows[i / 2][lastSaved]);
        rows[i / 2].pop();
        
        let nextRow = trs[i + 1].querySelector("td");
        let ul = nextRow.querySelector("ul");
        let list = ul.querySelectorAll("li");
        let lastTdNext = list[0];
        lastTdNext.remove();
        
        if (thArray.length - 1 === 0) {
          nextRow.remove();
          trs[i + 1].remove();
          delete rows[i / 2];
        }
        
        if (!rows[0]) {
          let tds = tr.querySelectorAll("td");
          tds[0].querySelector("span").classList.remove("red");
          tds[0].querySelector("span").classList.add("hidden");
        }
      }
      
      trThead.append(lastColumn.th);
      thArray.pop();
      
    }
  }

  function isBigger(ths) {
    let containerWidth = container.offsetWidth;
    let width = biggest;

    for (let i = 0; i < ths.length; i++) {
      width += offSets[i];
    }

    return width > containerWidth;
  }

  function isExpanding() {
    let increment = false;
    if (previousWidth < container.offsetWidth) {
      increment = true;
    }
    previousWidth = container.offsetWidth;

    return increment;
  }

  function templateTD(title, content, colspan) {
    const template = document.createElement("td");
    template.setAttribute("colspan", colspan);
    template.innerHTML = `
    <ul>
      <li>
        <strong>${title}</strong>
        ${content}
      </li>
    </ul>
  `;
    return template;
  }

  function templateLi(title, content) {
    const template = document.createElement("li");
    template.innerHTML = `
    <strong>${title}</strong>
    ${content}
  `;
    return template;
  }

  return {
    thead: initialData,
    renderize
  }
}

// Class initializer
class TableUI {
  thead;
  table = "";
  tbody = "";
  tfooter = ""
  adaptative;
  initialData;
  finalData;
  pages = 0;
  perPage = 5;
  btnPreview = "Prev"
  btnNext = "Next"
  currentPage = 1
  constructor(tableID) {
    this.table = document.getElementById(tableID);
    this.tbody = this.table.querySelector("tbody");
    this.thead = this.table.querySelector('thead');
  }

  create(props) {
    this.data = props.data
    this.loadData(this.query(this.perPage, this.currentPage))
    this.pages = this.getTotalPages(this.perPage, this.data.length)
    // Iniciamos la responsividad con los datos iniciales ----------
    this.initialData = globalUI(this.table, this.tbody)
    window.addEventListener("resize", this.initialData.renderize);
    // --------------------------------------------------------------

    if(props.perPage && props.perPage > 5) {
      this.perPage = props.perPage
    }

    if(props.btnNext) {
      this.btnNext = props.btnNext
    }

    if(props.btnPreview) {
      this.btnPreview = props.btnPreview
    }

    if(props.query) {
      this.query = props.query
    }

    this.loadFooter()
    this.onClick()

  }

  loadData(data) {
    this.tbody.innerHTML = ""
    data.forEach((info, i) => {
      let tr = document.createElement("tr");
      let trId = `tr-${i}`;
      tr.setAttribute("id", trId);
      if (i % 2 === 0) {
        tr.classList.add("tr-even");
      } else {
        tr.classList.add("tr-odd");
      }

      info.forEach((text, j) => {
        let td = document.createElement("td");
        if (j === 0) {
          td.innerHTML += `<span class="btn-open-plus hidden" trId="${trId}">+</span>`;
        }
        td.style.width = (1 / info.length) * 100 + "%";
        td.innerHTML += text;
        tr.appendChild(td);
      });

      this.tbody.appendChild(tr);
    });
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

  onClick() {
    this.tbody.onclick = (e) => {
      let trId = e.target.getAttribute("trId");
      if (trId) {
        let row = document.getElementById(trId);
        e.target.classList.toggle("red");
        row.nextSibling.classList.toggle("hidden");
      }
    };

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

  deactiveBtns() {
    let btns = this.tfooter.querySelectorAll('.btn-number')
    btns.forEach(btn => {
      btn.classList.remove('page-selected')
    })
  }

  getNextPage() {
    if(this.currentPage < this.pages) {
      this.currentPage++
      this.deactiveBtns()
      this.activateBtn()
      this.reRender()
    }
  }

  getPrevPage() {
    if(this.currentPage > 1) {
      this.currentPage--
      this.deactiveBtns()
      this.activateBtn()
      this.reRender()
    }
  }

  activateBtn() {
    let btns = this.tfooter.querySelectorAll('.btn-number')
    btns.forEach((btn, index)=> {
      if((index + 1) === this.currentPage) {
        btn.classList.add('page-selected')
      }
    })
    this.reRender()
  }

  reRender() {
    window.removeEventListener("resize", this.initialData.renderize);
    this.thead.innerHTML = "" 
    this.trThead = document.createElement('tr')
    this.initialData.thead[0].forEach(th => {
      this.trThead.appendChild(th)
    })
    this.thead.appendChild(this.trThead)       
    this.loadData(this.query(this.perPage, this.currentPage))
    this.initialData = globalUI(this.table, this.tbody)
    window.addEventListener("resize", this.initialData.renderize);
  }

  query(perPage, currentPage) {
    const init = (perPage * (currentPage - 1)) + 1
    const end = init + (perPage - 1)
    return this.data.slice((init - 1), end)
  }
}


