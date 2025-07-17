import { useEffect, useState } from "react";

const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const meals = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Postre"];

const getWeekDates = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentWeek = getWeekNumber(today);

  const janFirst = new Date(currentYear, 0, 1);
  const janFirstWeekday = janFirst.getDay() === 0 ? 7 : janFirst.getDay();
  const firstMonday = new Date(janFirst);
  firstMonday.setDate(janFirst.getDate() + (janFirstWeekday === 1 ? 0 : 8 - janFirstWeekday));

  const weeks = [];
  for (let w = 0; w < 52; w++) {
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weeks.push({
      weekNumber: w + 1,
      start: weekStart.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
      end: weekEnd.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
      isCurrent: w + 1 === currentWeek,
    });
  }
  return { weeks, currentWeek };
};

function getWeekNumber(date) {
  const tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = tempDate.getDay() || 7;
  tempDate.setDate(tempDate.getDate() + 4 - dayNum);
  const yearStart = new Date(tempDate.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
  return weekNum;
}

export default function Tracker() {
  const { weeks, currentWeek } = getWeekDates();
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("comida-tracker");
    return saved ? JSON.parse(saved) : generateInitialData();
  });

  const [selectedWeek, setSelectedWeek] = useState(() => {
  const savedWeek = localStorage.getItem("selected-week");
  return savedWeek ? Number(savedWeek) : currentWeek - 1;
});


 useEffect(() => {
  localStorage.setItem("selected-week", selectedWeek);
}, [selectedWeek]);

  function generateInitialData() {
    return Array.from({ length: 52 }, () => ({
      days: Array.from({ length: 7 }, () => ({
        meals: meals.map(() => ({ text: "", outOfPlace: false })),
        gym: false,
      })),
      weight: "",
    }));
  }

  const updateMeal = (weekIdx, dayIdx, mealIdx, newText) => {
    const newData = [...data];
    newData[weekIdx].days[dayIdx].meals[mealIdx].text = newText;
    setData(newData);
  };

  const toggleOutOfPlace = (weekIdx, dayIdx, mealIdx) => {
    const newData = [...data];
    const meal = newData[weekIdx].days[dayIdx].meals[mealIdx];
    meal.outOfPlace = !meal.outOfPlace;
    setData(newData);
  };

  const toggleGym = (weekIdx, dayIdx) => {
    const newData = [...data];
    newData[weekIdx].days[dayIdx].gym = !newData[weekIdx].days[dayIdx].gym;
    setData(newData);
  };

  const updateWeight = (weekIdx, newWeight) => {
    const newData = [...data];
    newData[weekIdx].weight = newWeight;
    setData(newData);
  };

  return (
    <div style={{ overflowX: "auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Seguimiento de Comidas
      </h1>

      <label>
        Semana:
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          style={{ marginLeft: "8px" }}
        >
          {weeks.map((week, idx) => (
            <option key={idx} value={idx}>
              Semana {week.weekNumber} ({week.start} – {week.end})
            </option>
          ))}
        </select>
      </label>

      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
          Semana {weeks[selectedWeek].weekNumber} ({weeks[selectedWeek].start} – {weeks[selectedWeek].end})
        </h2>

        <table className="table-auto border border-gray-300 w-full text-sm">
          <thead>
            <tr>
              <th>Comida</th>
              {daysOfWeek.map((day, dayIdx) => (
                <th key={dayIdx}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meals.map((meal, mealIdx) => (
              <tr key={mealIdx}>
                <td className="font-medium border px-2 py-1">{meal}</td>
                {data[selectedWeek].days.map((day, dayIdx) => (
                  <td
                    key={dayIdx}
                    className={`border px-2 py-1 ${day.meals[mealIdx].outOfPlace ? "bg-red-200" : ""
                      }`}
                    style={{ position: "relative" }}
                  >
                    <input
                      type="text"
                      value={day.meals[mealIdx].text}
                      onChange={(e) =>
                        updateMeal(selectedWeek, dayIdx, mealIdx, e.target.value)
                      }
                      className="w-full border-b border-gray-400 focus:outline-none bg-transparent pr-4"
                    />
                    <span
                      onClick={() =>
                        toggleOutOfPlace(selectedWeek, dayIdx, mealIdx)
                      }
                      style={{
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        color: day.meals[mealIdx].outOfPlace ? "red" : "#ccc",
                        position: "absolute",
                        right: 4,
                        bottom: 2,
                      }}
                      title={
                        day.meals[mealIdx].outOfPlace
                          ? "Desmarcar"
                          : "Marcar fuera de lugar"
                      }
                    >
                      ⬤
                    </span>
                  </td>
                ))}
              </tr>
            ))}

            <tr>
              <td className="font-medium border px-2 py-1">Gym</td>
              {data[selectedWeek].days.map((day, dayIdx) => (
                <td key={dayIdx} className="text-center border px-2 py-1">
                  <input
                    type="checkbox"
                    checked={day.gym}
                    onChange={() => toggleGym(selectedWeek, dayIdx)}
                  />
                </td>
              ))}
            </tr>

            <tr>
              <td className="font-medium border px-2 py-1">Peso</td>
              <td colSpan={7} className="text-right border px-2 py-1">
                Peso esta semana:
                <input
                  type="text"
                  value={data[selectedWeek].weight}
                  onChange={(e) => updateWeight(selectedWeek, e.target.value)}
                  className="ml-2 border-b border-gray-400 focus:outline-none"
                />
              </td>
            </tr>
          </tbody>
        </table>


      </div>
    </div>
  );
}
