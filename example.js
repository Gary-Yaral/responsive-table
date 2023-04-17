async function getData() {
  return await (
    await fetch('https://jsonplaceholder.typicode.com/posts')
  ).json()
}

function transformData(result) {
  return result.map(item => {
    const arr = Object.values(item)
    const valor = arr.splice(1, 1)[0];
    arr.splice(0, 0, valor);
    return arr
  })
}


(async() => {
  const json = await transformData(await getData())
  const rows = json.length
  const tableUI = new TableUI('myTable')
  tableUI.create({ 
    data: json, 
    idiom: "ES"
  /*totalRows: rows, 
    searchProps:{
      text: "Buscar",
      placeholder: "escribir..."
    },
    perPageProps:{
      textLeft: "Mostrar",
      textRight: "registros"
    },

    btnPreview: "Anterior",
    btnNext: "Siguiente", */
  })
})()
