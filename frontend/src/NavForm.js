import { useState } from 'react';

// TODO: implement backend API
const initialData = {
  "Bob McBobbison": { age: 25, gender: "M", situation: "unemployed", services: ["food", "substance", "housing"], notes: [] },
  "Ur Mom": { age: 56, gender: "F", situation: "homeless", services: ["mental", "housing"], notes: [] },
  "Jesse Richardson": { age: 32, gender: "N/A", situation: "bipolar disorder", services: ["mental", "substance"], notes: [] },
  "Susan": { age: 45, gender: "F", situation: "single mother", services: ["food", "housing"], notes: [] },
  "Michael Horston": { age: 65, gender: "M", situation: "substance abuse", services: ["substance"], notes: [] }
};

export default function NavigatorForm() {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '', gender: '', situation: '', services: [], notes: [] });
  const [note, setNote] = useState('');

  const handleSearch = () => {
    const person = data[searchTerm.trim()];
    if (person) {
      setFormVisible(false);
      setSearchResult({ ...person, name: searchTerm.trim() });
      setNote('');
    } else {
      setSearchResult(null);
      setFormVisible(true);
      setFormData({ name: searchTerm.trim(), age: '', gender: '', situation: '', services: [], notes: [] });
    }
  };

  const handleSubmit = () => {
    const newData = {
      ...data,
      [formData.name]: { ...formData }
    };
    setData(newData);
    localStorage.setItem(formData.name, JSON.stringify(formData));
    setFormVisible(false);
    setSearchResult({ ...formData });
    alert("Information saved successfully!");
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    const updated = {
      ...data,
      [searchResult.name]: {
        ...data[searchResult.name],
        notes: [...data[searchResult.name].notes, `${new Date().toLocaleString()}: ${note.trim()}`]
      }
    };
    setData(updated);
    setNote('');
    setSearchResult(updated[searchResult.name]);
    localStorage.setItem(searchResult.name, JSON.stringify(updated[searchResult.name]));
    alert("Note added successfully!");
  };

  const toggleService = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Navigator Form</h2>

      <div className="space-y-6">
        <h2 className="text-lg font-medium text-blue-800 mb-2">Search for an Individual</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Enter Name"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Search</button>
        </div>
      </div>

      {searchResult && (
        <div className="mt-6 text-gray-800">
          <p><strong>Name:</strong> {searchTerm}</p>
          <p><strong>Age:</strong> {searchResult.age}</p>
          <p><strong>Gender:</strong> {searchResult.gender}</p>
          <p><strong>Services Needed:</strong> {searchResult.services.join(', ')}</p>
          <p><strong>Current Situation:</strong> {searchResult.situation}</p>

          {searchResult.notes?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold">Additional Notes</h3>
              <ul className="list-disc list-inside">
                {searchResult.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-4 bg-gray-200 rounded-lg p-4 shadow-md">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Additional Notes"
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <button onClick={handleAddNote} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Add Note</button>
          </div>
        </div>
      )}

      {formVisible && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Enter Information</h2>
          {['Name', 'Age', 'Gender', 'Current Situation'].map(field => (
            <div key={field} className="bg-gray-200 rounded-lg p-4 shadow-md mb-4">
              <input
                type="text"
                placeholder={field}
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData[field.toLowerCase().replace(' ', '')]}
                onChange={(e) => setFormData({ ...formData, [field.toLowerCase().replace(' ', '')]: e.target.value })}
              />
            </div>
          ))}

          <div className="bg-gray-200 rounded-lg p-4 shadow-md mb-4">
            <h3 className="font-semibold mb-2">Services Needed</h3>
            {['food', 'mental', 'substance', 'housing'].map(service => (
              <label key={service} className="block">
                <input
                  type="checkbox"
                  checked={formData.services.includes(service)}
                  onChange={() => toggleService(service)}
                />{' '}
                {service.charAt(0).toUpperCase() + service.slice(1)}
              </label>
            ))}
          </div>

          <button onClick={handleSubmit} className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700">Submit</button>
        </div>
      )}
    </div>
  );
}
