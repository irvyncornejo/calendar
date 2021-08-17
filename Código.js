const onOpen = () => {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('📅 Horarios').addItem('🛠 Generar','someFunction').addToUi()
  
}

const loadData = () =>{
  const info = new SheetValidate('Config Profesores').validateKeys()
  const range = info['range']
  const data = info['sheet'].getRange(range[0], range[1], range[2], range[3]).getValues()
  const keys = data[0]
  const teachers = createValuesKeys(data)
  Logger.log(createRangeAvaliable(teachers, keys))
}