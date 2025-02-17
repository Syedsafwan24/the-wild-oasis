import DateSelector from "@/app/_components/DateSelector";
import ReservationForm from "@/app/_components/ReservationForm";
import { getBookedDatesByCabinId, getSettings } from "../_lib/data-service";


async function Reservation({ cabin }) {
  const settings = await getSettings();
  const bookedDates = await getBookedDatesByCabinId(cabin.id);
  Promise.all([settings, bookedDates]);
  return (

    <div >
      <DateSelector settings={settings} bookedDates={bookedDates} cabin={cabin} />
      <ReservationForm cabin={cabin} />
    </div>

  )
}

export default Reservation
