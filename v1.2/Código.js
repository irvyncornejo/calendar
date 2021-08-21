const onOpen = () => {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('📅 Horarios').addItem('🛠 Generar','someFunction').addToUi()
  
}

const loadData = () => {
  const propertiesUser = new PropertiesU()
  const dataInfoTeachers = new InformationTeachers().loadData()
  const dataInfoGeneral = new GeneralInfo().createValues()
  propertiesUser.createProperties(['dataInfoTeachers', JSON.stringify(dataInfoTeachers)])
  propertiesUser.createProperties(dataInfoGeneral)
}

const schedulePrim = () => new Schedule('Primaria').create() 

const showProperties = () =>{
  const propertiesUser = PropertiesService.getUserProperties()
  for (key in propertiesUser.getProperties()){
    Logger.log(key)
  }
}

