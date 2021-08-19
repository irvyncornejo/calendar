const test = () =>{
  const values = new GeneralInfo().createValues()
  createProperties(values)
}

const test2 = () =>{
  const properties = PropertiesService.getScriptProperties()
  const values = properties.getProperties()
  for(key in values){
    Logger.log(values[key])
  }
}

const letter = (index) => ['B','C','D','E','F'][index]

const createProperties = (values) => {
  const scritpProps = PropertiesService.getScriptProperties()
  for(key in values){
    scritpProps.setProperty(key, JSON.stringify(values[key]))
  }
}

const createValuesKeys = (data) =>{
  const keys = data[0]
  const values = data.slice(1,-1)
  const elements = []
  values.map(teacher=>{
    let infoTeacher = {}
    keys.forEach((key, index)=>{
      infoTeacher[`${key}`] = teacher[index]
    })
    elements.push(infoTeacher)
  })
  return elements
}

const defineRangeHours = (teacher) =>{
  const hours = [1,2,3,4,5]//TODO valor dependiendo las horas que defina la persona
  const indexDay = ['L', 'Ma', 'Mr', 'J', 'V']
  const defineValues = (letterInd) => hours.map(hour => `${letterInd}${hour}`)
  const hoursAvaliable = []
  indexDay.forEach((day, index)=>{
    let letterInd = letter(index)
    teacher[`${day}`] ? hoursAvaliable.push(...defineValues(letterInd)) : ''
  })
  indexDay.forEach(day => delete teacher[`${day}`])
  return hoursAvaliable
}

const createRangeAvaliable = (data, keys) =>{
  data.forEach(teacher=>{
    teacher['hoursAvaliable'] = defineRangeHours(teacher)
  })
  return groupSubjects(data, keys)
}

const groupSubjects = (data, keys) =>{
  const rePrincipal = /^Asignatura [0-9]$/
  const subjects = keys.filter(key => rePrincipal.test(key))
  const subjectsTeacher = {}
  subjects.forEach(value =>{
    subjectsTeacher[`${value}`] = keys.filter(key => key.includes(value))
  })
  return addSubjects(data, subjectsTeacher)
}

const addSubjects = (data, subjectsTeacher) =>{
  const subjectsKeys = Object.keys(subjectsTeacher)
  data.forEach(teacher=>{
    let subjects = {}
    subjectsKeys.forEach(key=>{
      subjects[`${key}`] = {
        name : teacher[subjectsTeacher[`${key}`][0]],
        sessions: teacher[subjectsTeacher[`${key}`][1]],
        section: teacher[subjectsTeacher[`${key}`][2]],
        grade: teacher[subjectsTeacher[`${key}`][3]]
      }
      delete teacher[`${key}`]
      delete teacher[`${key}|Clases a la semana`]
      delete teacher[`${key}|Sección`]
    })
    teacher['subjects'] = subjects
  })
  return data
}

class SheetValidate{
  constructor(name){
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
  }
  validateKeys(){
    const lastRow = this.sheet.getLastRow()
    const lastColumn = this.sheet.getLastColumn()
    //row, column, numRows, numColumns
    const data = this.sheet.getRange(1,1, lastRow, lastColumn).getValues()[0]
    const dataForKeys = this.getKeys(data, lastColumn)
    if(lastColumn === dataForKeys.lastColumn){
      return {keys: dataForKeys.keys, range:[1,1,lastRow, lastColumn], sheet:this.sheet, error: null}
    }else return {keys: dataForKeys.keys, range:[1,1,lastRow, dataForKeys.lastColumn], sheet:this.sheet, error:'Diferentes'}
  }

  getKeys(data, lastColumn){
    const keys = []
    data.forEach(key => key != '' ? keys.push(key) : '')
    if(keys.length === lastColumn) return {keys: keys, lastColumn: lastColumn}
    else return {keys: keys, lastColumn: keys.length}
  }
}

class GeneralInfo{
  constructor(name='Config Gral'){
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
  }
  getInfo(){
    const data = this.sheet.getRange('B4:H10').getValues()
    data.slice(1, -1).forEach(section => section.splice(0, 1, section[0].replace('Horario de ','')))
    const sections = data.slice(1, -1)
    return sections
  }
  createValues(){
    const info = this.getInfo()
    const sections = {}
    info.forEach(section =>{
      sections[`${section[0]}`] = {
        schedule: {start: section[1], end:section[2]},
        schoolBreak: {
          1:{
            start: section[3],
            end: section[4],
          },
          2:{
            start: section[5],
            end: section[6]
          }
        }
      }
    })
    return this.getSections(sections)
  }
  getSections(sections){
    const ranges = {'Jardín de Niños': 'B16:H18','Primaria':'B22:H27', 'Secundaria':'B31:H33', 'Preparatoria':'B37:H39'} 
    Object.keys(ranges).forEach((key, index) =>{
      let values = this.sheet.getRange(ranges[`${key}`]).getValues()
      let grades = {}
      values.forEach(grade =>
        grades[`${grade[0]}`] = grade.filter((elem, index) => index > 0 && elem > '' )
      )
      sections[`${key}`]['grades'] = grades
      sections[`${key}`]['num'] = index+1
    })
    return sections
  }
}
