const onOpen = () => {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('📅 Horarios')
    .addItem('🛠 Cargar Datos','loadData')
    .addSeparator()
      .addSubMenu(ui.createMenu('Crear')
        .addItem('Primaria', 'schedulePrim')
        .addItem('Secundaria', 'scheduleSec')
        .addItem('Preparatoria', 'schedulePrep'))
    .addToUi()
}

const loadData = () => {
  const ui = SpreadsheetApp.getUi()
  try{
    const propertiesUser = new PropertiesU()
    const dataInfoTeachers = new InformationTeachers().loadData()
    const dataInfoGeneral = new GeneralInfo().createValues()
    propertiesUser.createProperties(['dataInfoTeachers', JSON.stringify(dataInfoTeachers)])
    propertiesUser.createProperties(dataInfoGeneral.sections)
    propertiesUser.createProperties(dataInfoGeneral.subjectsForSection)
    ui.alert('Los datos se cargaron de forma correcta')
  }catch(e){
    ui.alert(e)
  }
  
}

const schedulePrim = () => new Schedule('Primaria').create() 
const scheduleSec = () => new Schedule('Secundaria').create()
const schedulePrep = () => new Schedule('Preparatoria').create()

const showProperties = () =>{
  const propertiesUser = PropertiesService.getUserProperties()
  for (key in propertiesUser.getProperties()){
    Logger.log(propertiesUser.getProperties()[key])
  }
}

