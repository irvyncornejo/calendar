const letter = (index) => ['B','C','D','E','F'][index]

class PropertiesU{
  constructor(){
    this.userProps = PropertiesService.getUserProperties()
  }
  getProperties(key){
    const values = this.userProps.getProperties()
    return JSON.parse(values[key])
  }
  createProperties(values){
    if(Array.isArray(values)){
      this.userProps.setProperty(values[0], values[1])
    }else{
      for(let key in values){
        this.userProps.setProperty(key, JSON.stringify(values[key]))
      }
    }
  }
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
    //TODO CAMBIAR POR VALORES DINAMICOS
    const ranges = {'Jardín de Niños': 'B16:H18','Primaria':'B22:H27', 'Secundaria':'B31:H33', 'Preparatoria':'B37:H39'} 
    Object.keys(ranges).forEach((key, index) =>{
      const values = this.sheet.getRange(ranges[`${key}`]).getValues()
      const grades = {}
      values.forEach(grade =>
        grades[`${grade[0]}`] = grade.filter((elem, index) => index > 0 && elem > '' )
      )
      sections[`${key}`]['grades'] = grades
      sections[`${key}`]['num'] = index+1
    })
    const subjectsForSection =  this.getSubjects()
    return {sections:sections, subjectsForSection:subjectsForSection}
  }
  getSubjects(){
    const dataSubjects = new SheetValidate('Config Profesores').validateKeys()
    const columnsSubjects = []
    dataSubjects['keys'].forEach((key, index)=> key.includes('Asignatura') 
      ? columnsSubjects.push(`${index}|${key}`)
      : ''
    )
    const length = columnsSubjects.length
    const sheet = dataSubjects['sheet']
    const columnStart = parseInt(columnsSubjects[0].split('|')[0])
    const subjectsForSection = {}
    const values = sheet.getRange(1,
      `${columnStart + 1}`, 
      dataSubjects.range[3], 
      `${parseInt(columnsSubjects[length-2].split('|')[0]) - columnStart + 2}`).getValues()
    const rows = 5
    const valuesClean = []
    values.slice(1,-1).forEach(row =>{
      let start = 0
      while(start < length-1){
        if(row[start] != '' && row[start] != undefined){
          valuesClean.push(row.slice(start, start+rows))
        }
        start+=rows
      }
    })
    valuesClean.forEach(row =>{
      const section = `subjects|${row[3]}`
      if(Object.keys(subjectsForSection).includes(section)){
        if(Object.keys(subjectsForSection[section]).includes(`${row[4]}`)){
          if(!subjectsForSection[section][`${row[4]}`].includes(row[0])){
            subjectsForSection[section][`${row[4]}`].push(row[0])
          }
        }
        else{
          subjectsForSection[section][`${row[4]}`] = [row[0]]
        }
      }
      else{
        subjectsForSection[section] = {}
        subjectsForSection[section][`${row[4]}`] = [row[0]]
      }
    })
    return subjectsForSection
  }
}

class InformationTeachers{
  constructor(name='Config Profesores'){
    this.info = new SheetValidate(name).validateKeys()
  }
  loadData(){
    const range = this.info['range']
    const data = this.info['sheet'].getRange(range[0], range[1], range[2], range[3]).getValues()
    const keys = data[0]
    const teachers = this.createValuesKeys(data)
    return this.createRangeAvaliable(teachers, keys)
  }
  createValuesKeys(data){
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
  createRangeAvaliable(data, keys){
    data.forEach(teacher=>{
      teacher['hoursAvaliable'] = this.defineRangeHours(teacher)
    })
    return this.groupSubjects(data, keys)
  }

  groupSubjects(data, keys){
    const rePrincipal = /^Asignatura [0-9]$/
    const subjects = keys.filter(key => rePrincipal.test(key))
    const subjectsTeacher = {}
    subjects.forEach(value =>{
      subjectsTeacher[`${value}`] = keys.filter(key => key.includes(value))
    })
    return this.addSubjects(data, subjectsTeacher)
}

  addSubjects(data, subjectsTeacher){
    const subjectsKeys = Object.keys(subjectsTeacher)
    data.forEach(teacher=>{
      let subjects = {}
      let sections = []
      subjectsKeys.forEach(key=>{
        subjects[`${key}`] = {
          name : teacher[subjectsTeacher[`${key}`][0]],
          sessions: teacher[subjectsTeacher[`${key}`][1]],
          blocks: teacher[subjectsTeacher[`${key}`][2]],
          section: teacher[subjectsTeacher[`${key}`][3]],
          grade: teacher[subjectsTeacher[`${key}`][4]]
        }
        teacher[subjectsTeacher[`${key}`][3]] =! '' ? sections.push(teacher[subjectsTeacher[`${key}`][3]]) : ''
        delete teacher[`${key}`]
        delete teacher[`${key}|Clases a la semana`]
        delete teacher[`${key}|Sección`]
      })
      teacher['subjects'] = subjects
      teacher['sections'] = sections
    })
    return data
  }
  defineRangeHours(teacher){
    const hours = [2,3,4,6,7,8,10,12]//TODO valor dependiendo las horas que defina la persona
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
}

class CellsHours{
  constructor(spreadSheet){
    this.spreadSheet = spreadSheet
    //Hora de salida podrías ser diferente 'A2:A15'
  }
  getValuesForWeek(name){
    const spacesForWeek = this.validateSpaces(name)
    return spacesForWeek
  }
  getValuesForDay(name){
    const indexDays = ['B','C','D','E','F']
    const spacesForWeek =  this.validateSpaces(name)
    const spacesForDays = {}
    indexDays.forEach(day =>{
      let days = spacesForWeek.filter(cell => cell.includes(day))
      spacesForDays[`${day}`] = days
    })
    return spacesForDays
  }
  
  validateSpaces(name){
    const sheet = this.spreadSheet.getSheetByName(name)
    const data = sheet.getRange('B2:F15').getValues()
    const hoursClass = []
    const cells= (row, hourIndex) => row.forEach((cell, index)=>{
        cell === ''
          ? hoursClass.push(`${letter(index)}${hourIndex+2}`)
          : ''
    })
    data.forEach((row, index) =>{
      const hourIndex = index
      index === 4 || index === 9 
        ? ''  
        : cells(row, hourIndex)
    })
    return hoursClass
  }
}

class Schedule{
  constructor(section){
    this.section = section
    this.spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
    this.cellsForGroup = new CellsHours(this.spreadSheet)
  }
  getDataSection(){
    const properties = new PropertiesU()
    const dataTeachers = properties.getProperties('dataInfoTeachers')
    const dataSection = properties.getProperties(this.section)
    const teachers = dataTeachers.filter(row => row['sections'].includes(this.section))
    return {dataSection:dataSection, teachers:teachers}
  }

  getDataForGroup(group){
    const cells = this.cellsForGroup.getValuesForWeek(group)
    return cells
  }

  create(){
    const dataForSection = this.getDataSection()
    const grades = dataForSection['dataSection']['grades']
    const teachers = this.groupForGrade(dataForSection['teachers'], grades)
    this.insertSheet(dataForSection['dataSection']['grades'])
    this.insertValuesForSection(teachers, grades)
  }

  groupForGrade(teachers, grades){
    const teachersForGrade = {}
    for(let grade in grades){
      const teachersList = []
      teachers.forEach(teacher =>{
        Object.keys(teacher['subjects']).forEach(a =>{
          teacher['subjects'][a]['section'] === this.section 
          && teacher['subjects'][a]['grade'] == grade
            ? teachersList.push(teacher)
            : ''
        })
      })
      teachersForGrade[`${grade}`] = teachersList
    }
    return teachersForGrade
  }

  insertSheet(grades){
    const sheets = this.spreadSheet.getSheets().map(sheet => sheet.getName())
    for(let grade in grades){
      grades[`${grade}`].forEach(group =>{
        if(sheets.includes(`${group}`)){
          return 0
        }else{
          const sheet = this.spreadSheet.getSheetByName('Hoja Base Horario').copyTo(this.spreadSheet)
          sheet.setName(`${group}`)
        }
      })
    }
  }

  insertValuesForSection(teachers, grades){
    for(let grade in grades){
      const group = grades[`${grade}`][0]
      const sheet = this.spreadSheet.getSheetByName(group)
      let cellsAvaliableForGroup = this.getDataForGroup(group)
      teachers[`${grade}`].forEach(teacher =>{
        let teachersHours = teacher['hoursAvaliable']
        Object.keys(teacher['subjects']).forEach(subject =>{
          let dataSubject = teacher['subjects'][`${subject}`]
          if(dataSubject['grade'] == grade && dataSubject['sessions'] > ''){
            //CHECAR SI EL ALGORITMO PARA LA INSERCIÓN MULTIPLE ES FUNCIONAL
            this.insertCellValue(teacher, subject, teachersHours, cellsAvaliableForGroup, sheet)
          }
        })
      })
    }
  }
  
  insertCellValue(teacher, subject, teachersHours, cellsAvaliableForGroup, sheet){
    let numberSessions = parseInt(teacher['subjects'][`${subject}`]['sessions'])
    Array.from(Array(numberSessions).keys()).forEach(elem=>{
      let indexsCells = this.indexCells(teachersHours, cellsAvaliableForGroup)
      if(indexsCells['indexTeacherHour']){
        let ind = indexsCells['indexTeacherHour']
        sheet.getRange(`${teachersHours[ind]}`).setValue(`${teacher['subjects'][`${subject}`]['name']}`)
        teachersHours.splice(ind,1)
        cellsAvaliableForGroup.splice(indexsCells['indexAvaliableHour'], 1)
      }
    })
  }

  validateSessions(){

  }

  indexCells(hoursTeacher, hoursAvaliables){
    let indexTeacherHour
    let indexAvaliableHour
    for(const hour in hoursTeacher){
      indexAvaliableHour = hoursAvaliables.indexOf(hoursTeacher[hour])
      if (indexAvaliableHour != -1){
        indexTeacherHour = hour
        break
      }
    }
    return {indexTeacherHour:indexTeacherHour, indexAvaliableHour:indexAvaliableHour}
  }


}

