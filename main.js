const createSchedules = () =>{
  const informationTeacher = new InformationTeacher().getData()
  const groups = ['4010', '5010', '6010', '6020', '6030', '6040']
  const calendar = new CalendarValues()
  const dataSubjects = new DataSeccion('4').getValues()
  //calendar.insertSheet(groups)
  //Logger.log(calendar.getCells('4010'))
  Logger.log(informationTeacher)
}

const inserValues= ()=>{

}