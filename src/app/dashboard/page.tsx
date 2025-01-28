"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Claims");

  // Dummy data
  const dummyClaims = [
    { id: 18940, customer_name: "Radha Mohan", status: "Claim Initiated", date: "Today" },
    { id: 18941, customer_name: "Roney Kumar", status: "Claim Initiated", date: "Yesterday" },
    { id: 18948, customer_name: "Kavita Ronak", status: "BER Approved", date: "16/01/2025" },
    { id: 18943, customer_name: "Karan Kush", status: "Approved", date: "06/01/2025" },
    { id: 18946, customer_name: "Aayansh Kumar", status: "BER Approved", date: "05/01/2025" },
    { id: 18949, customer_name: "Rahul Soni", status: "BER Approved", date: "03/01/2025" },
    { id: 18950, customer_name: "Tarun Sharma", status: "Cancelled", date: "10/01/2025" },
    { id: 18955, customer_name: "Kunj Mohan", status: "Rejected", date: "16/12/2024" },
    { id: 18965, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 18966, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 18967, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 18968, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 189122, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 189455, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 189687, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 18969897, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 1896656, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 18969832, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 1896543, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
    { id: 189654545, customer_name: "Radha Mohan", status: "Closed", date: "14/12/2024" },
  ];

  // Load dummy data on component mount and set the first claim as selected
  useEffect(() => {
    setClaims(dummyClaims);
    setFilteredClaims(dummyClaims);
    if (dummyClaims.length > 0) {
      setSelectedClaim(dummyClaims[0]); // Select the first claim by default
    }
  }, []);

  // Handle Search Input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const searchResults = claims.filter(
      (claim) =>
        claim.customer_name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        claim.id.toString().includes(e.target.value) ||
        claim.status.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredClaims(searchResults);
  };

  // Handle Filter Selection
  const handleFilterChange = (filter) => {
    setFilterStatus(filter);
    if (filter === "All Claims") {
      setFilteredClaims(claims);
    } else {
      const filteredResults = claims.filter(
        (claim) => claim.status.toLowerCase() === filter.toLowerCase()
      );
      setFilteredClaims(filteredResults);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="flex items-center justify-between bg-primaryBlue p-4 text-white shadow-sm">
        <h1 className="text-lg font-bold">Welcome Ahmedabad Service Center</h1>
        <div className="flex items-center gap-4">
          <button className="btn btn-outline text-white border-white">Initiate Claim</button>
          <div className="flex items-center gap-2">
            <img
              src="/profile.jpg"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <span>Moni Roy</span>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="bg-white py-3 mt-3 px-6 rounded-md shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search Claim, customer mobile, or IMEI number..."
            className="input input-bordered w-full md:w-1/2"
          />
          <button className="btn bg-primaryBlue text-white ml-4">Search</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[0.8fr_2.2fr] gap-3 p-3">
        {/* Left Sidebar */}
        <aside className="bg-white p-3 rounded-md shadow-sm overflow-auto max-h-[calc(100vh-128px)]">
          {/* Filter Section */}
          <div className="mb-3 space-y-2">
            <div className="flex gap-2">
              <button
                className={`btn ${filterStatus === "All Claims" ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleFilterChange("All Claims")}
              >
                All Claims
              </button>
              <button
                className={`btn ${
                  filterStatus === "Claim Initiated" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => handleFilterChange("Claim Initiated")}
              >
                Initiated
              </button>
              <button
                className={`btn ${filterStatus === "Approved" ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleFilterChange("Approved")}
              >
                Approved
              </button>
            </div>
            <div className="flex gap-2">
              <button
                className={`btn ${
                  filterStatus === "BER Approved" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => handleFilterChange("BER Approved")}
              >
                BER Approved
              </button>
              <button
                className={`btn ${filterStatus === "Rejected" ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleFilterChange("Rejected")}
              >
                Rejected
              </button>
              <button
                className={`btn ${filterStatus === "Cancelled" ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleFilterChange("Cancelled")}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Claims List */}
          <ul>
            {filteredClaims.map((claim, index) => (
              <li
                key={index}
                className={`flex justify-between p-2 border-b hover:bg-gray-100 cursor-pointer ${
                  selectedClaim?.id === claim.id ? "bg-lightBlue" : ""
                } rounded-md`}
                onClick={() => setSelectedClaim(claim)}
              >
                <div>
                  <p className="font-semibold">{claim.id}</p>
                  <p className="text-sm text-gray-600">{claim.customer_name}</p>
                </div>
                <div>
                  <p
                    className={`badge ${
                      claim.status.includes("Initiated")
                        ? "badge-primary"
                        : claim.status.includes("Approved")
                        ? "badge-success"
                        : "badge-secondary"
                    }`}
                  >
                    {claim.status}
                  </p>
                  <p className="text-sm text-gray-500">{claim.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right Sidebar */}
        <main className="bg-white p-3 rounded-md shadow-sm overflow-auto">
          {selectedClaim ? (
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">Claim Details</h2>
              <p>
                <strong>Claim ID:</strong> {selectedClaim.id}
              </p>
              <p>
                <strong>Customer Name:</strong> {selectedClaim.customer_name}
              </p>
              <p>
                <strong>Status:</strong> {selectedClaim.status}
              </p>
              <p>
                <strong>Date:</strong> {selectedClaim.date}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <img
                src="/empty-box.svg"
                alt="Empty"
                className="w-32 mx-auto mb-4"
              />
              <h2 className="text-lg font-semibold">Select an item to read</h2>
              <p className="text-gray-500">Nothing is selected</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
