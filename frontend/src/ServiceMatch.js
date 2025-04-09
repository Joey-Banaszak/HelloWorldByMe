import React, { useEffect, useState } from "react";

// shelter data used for testing
const sheltersData = [
  {
    name: "Our Family Services Reunion House",
    total_beds: 20,
    available_beds: 3,
    restrictions: {
      gender: "any",
      age_range: "12-17",
      services: "any",
      notes:
        "Only takes unaccompanied youth aged 12-17, go to nearest Safe Place and call number",
    },
    bed_secured: false,
  },
  {
    name: "Our Family Services Youth",
    total_beds: 15,
    available_beds: 0,
    restrictions: {
      gender: "any",
      age_range: "18-24",
      services: "any",
      notes:
        "Only takes aged 18-24, complete VI-SPDAT with CE access point for shelter referral. Call OFSY at given hours/days to receive more information",
    },
    bed_secured: false,
  },
  {
    name: "Gospel Rescue Mission",
    total_beds: 350,
    available_beds: 0,
    restrictions: {
      gender: "any",
      age_range: "18-24",
      services: "any",
      notes:
        "Must come to location ASAP, as first come, serve first. Services are program-based.",
    },
    bed_secured: false,
  },
  {
    name: "Primavera Casa Paloma Women's Shelter",
    total_beds: 9,
    available_beds: 1,
    restrictions: {
      gender: "female",
      age_range: "18+",
      services: "any",
      notes:
        "Only serves single women. ID and rapid test is required. 90-day stays and is also first come, first serve.",
    },
    bed_secured: false,
  },
];

const ServiceMatch = () => {
  // default values
  const [clients, setClients] = useState({});
  const [selectedClient, setSelectedClient] = useState("");
  const [age, setAge] = useState("12-17");
  const [gender, setGender] = useState("Male");
  const [services, setServices] = useState("any");
  const [matches, setMatches] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);

  useEffect(() => {
    const storedClients = JSON.parse(localStorage.getItem("clients")) || {};
    setClients(storedClients);
  }, []);

  const handleMatch = () => {
    if (!clients[selectedClient]) {
      alert("Please select a client");
      return;
    }
    // portion that handles actual service matching data
    const matchedShelters = sheltersData.filter((shelter) => {
      const ageMatch =
        shelter.restrictions.age_range === age ||
        (age === "25+" && shelter.restrictions.age_range === "18+") ||
        (age === "18-24" &&
          (shelter.restrictions.age_range === "18-24" ||
            shelter.restrictions.age_range === "18+"));

      const genderMatch =
        shelter.restrictions.gender === "any" ||
        shelter.restrictions.gender
          .toLowerCase()
          .startsWith(gender.toLowerCase().charAt(0));

      const servicesMatch =
        services === "any" ||
        shelter.restrictions.services === "any" ||
        shelter.restrictions.services === services;

      return (
        shelter.available_beds > 0 && ageMatch && genderMatch && servicesMatch
      );
    });

    setMatches(matchedShelters);
  };

  const handleSubmit = () => {
    if (!selectedShelter) {
      alert("Please select a shelter before submitting.");
      return;
    }

    localStorage.setItem("selectedShelter", JSON.stringify(selectedShelter));
    alert(`Shelter saved: ${selectedShelter.name}`);
  };

  // handles displays
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl text-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-center">Service Matching</h2>

      <div className="mb-6">
        <label className="block mb-2 text-blue-800 font-medium">
          Select Individual
        </label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">--Select Individual--</option>
          {Object.keys(clients).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3 mb-4">
        <label className="block">
          Age:
          <select
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="12-17">12-17</option>
            <option value="18-24">18-24</option>
            <option value="25+">25+</option>
          </select>
        </label>
      </div>

      <div className="space-y-3 mb-4">
        <label className="block">
          Gender:
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="any">Not Sure</option>
          </select>
        </label>
      </div>

      <div className="space-y-3 mb-4">
        <label className="block">
          Mental Health/SUD/General Needs:
          <select
            value={services}
            onChange={(e) => setServices(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="any">Wants help, any kind</option>
            <option value="yes">Wants help, mental health/SUD related</option>
            <option value="no">Wants NO help</option>
          </select>
        </label>
        <button
          onClick={handleMatch}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Find Services
        </button>
      </div>

      <div className="mt-4">
        {matches.length === 0 ? (
          <p>No shelters available</p>
        ) : (
          matches.map((shelter, idx) => (
            <div
              key={idx}
              className="border p-4 mb-3 bg-white shadow rounded-md"
            >
              <h3 className="font-bold">{shelter.name}</h3>
              <p>Available Beds: {shelter.available_beds}</p>
              <p>Restrictions: {shelter.restrictions.notes}</p>
              <label className="flex items-center mt-2">
                <input
                  type="radio"
                  name="selectedShelter"
                  value={idx}
                  onChange={() => setSelectedShelter(shelter)}
                  className="mr-2"
                />
                Bed Secured
              </label>
            </div>
          ))
        )}
      </div>

      {matches.length > 0 && (
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mt-4"
        >
          Submit
        </button>
      )}
    </div>
  );
};

export default ServiceMatch;
