const onOpen = () => {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('📅 Horarios').addItem('🛠 Generar','someFunction').addToUi()
  
}

const loadData = () => {
  const propertiesUser = new PropertiesU()
  const data = new InformationTeachers().loadData()
  propertiesUser.createProperties(['data', JSON.stringify(data)])
  
}


