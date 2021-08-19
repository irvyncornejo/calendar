const createSchedules = () =>{
  const informationTeacher = new InformationTeacher().getData()
  const groups = ['4010', '5010', '6010', '6020', '6030', '6040']
  const calendar = new CalendarValues()
  const dataSubjects = new DataSeccion('4').getValues()
  //calendar.insertSheet(groups)
  //
  calendar.insertValueRestric(dataSubjects, informationTeacher)
}

const inserValues= ()=>{

}