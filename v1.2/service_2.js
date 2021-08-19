class DataSeccion{
  constructor(seccion){
    this.seccion = seccion
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TR_ASIGNATURAS')
  }
  getValues(){
    const rangeData = new SheetValidate('TR_ASIGNATURAS').validateKeys()
    const sheet = rangeData['sheet']
    const range = rangeData['range']
    const dataValues = sheet.getRange(range[0], range[1], range[2], range[3]).getValues()
    const rangeValues = dataValues.filter(row => row[4] == this.seccion)
    return this.groupTeacher(rangeValues)
  }
  groupSubjects(data){
    const groups = createObjectValues(data, 3)
    return groups
  }
  groupTeacher(data){
    const teachers = createObjectValues(data, 1)
    return teachers
  }
}