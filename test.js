const a = () => Logger.log(new InformationTeacher().getData())
const y = () => Logger.log(new CellsHours().getValuesForWeek())
const x = () => Logger.log(new SheetValidate('TR_ASIGNATURAS').validateKeys())
const w = () => Logger.log(new DataSeccion().getValues())
const z = () => new CalendarValues().insertSheet()