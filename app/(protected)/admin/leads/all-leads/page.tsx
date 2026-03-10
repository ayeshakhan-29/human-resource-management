"use client"
import { Header } from "@/components/header"
import React from "react"
import {
  Mail,
  Phone,
  Building2,
  Eye,
  Pencil,
  Trash2,
  CheckCircle
} from "lucide-react"

const leads = [
  {
    id: 1,
    name: "John Smith",
    company: "Tech Solutions",
    email: "john@techsolutions.com",
    phone: "+1 234 567 890",
    status: "New",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    company: "Creative Agency",
    email: "sarah@creativeagency.com",
    phone: "+1 555 212 789",
    status: "Contacted",
  },
  {
    id: 3,
    name: "Michael Brown",
    company: "Global Marketing",
    email: "michael@globalmarketing.com",
    phone: "+1 555 678 234",
    status: "Qualified",
  },
  {
    id: 4,
    name: "Emma Wilson",
    company: "Startup Hub",
    email: "emma@startuphub.com",
    phone: "+1 555 998 123",
    status: "Proposal Sent",
  },
  {
    id: 5,
    name: "David Lee",
    company: "Enterprise Corp",
    email: "david@enterprise.com",
    phone: "+1 555 345 876",
    status: "Negotiation",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-700"

    case "Contacted":
      return "bg-indigo-100 text-indigo-700"

    case "Qualified":
      return "bg-purple-100 text-purple-700"

    case "Proposal Sent":
      return "bg-yellow-100 text-yellow-700"

    case "Negotiation":
      return "bg-orange-100 text-orange-700"

    case "Won":
      return "bg-green-100 text-green-700"

    case "Lost":
      return "bg-red-100 text-red-700"

    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function LeadsPage() {
  return (
    <>
     <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Leads" },
      
        ]}
      />
       <div className="p-4 sm:p-6 space-y-6"></div>
  
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Lead Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Track and manage your sales leads
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">
          + Add Lead
        </button>

      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">

        <table className="w-full min-w-[700px] text-sm">

          {/* Table Head */}
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-3 sm:p-4 text-left">Lead</th>
              <th className="p-3 sm:p-4 text-left">Company</th>
              <th className="p-3 sm:p-4 text-left">Contact</th>
              <th className="p-3 sm:p-4 text-left">Status</th>
              <th className="p-3 sm:p-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>

            {leads.map((lead) => (

              <tr
                key={lead.id}
                className="border-b hover:bg-gray-50 transition"
              >

                {/* Lead Name */}
                <td className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">

                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                      {lead.name.charAt(0)}
                    </div>

                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-gray-500">Lead #{lead.id}</p>
                    </div>

                  </div>
                </td>

                {/* Company */}
                <td className="p-3 sm:p-4 text-gray-600">

                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    {lead.company}
                  </div>

                </td>

                {/* Contact */}
                <td className="p-3 sm:p-4 text-gray-600 space-y-1">

                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span className="break-all">{lead.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    {lead.phone}
                  </div>

                </td>

                {/* Status */}
                <td className="p-3 sm:p-4">

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>

                </td>

                {/* Actions */}
                <td className="p-3 sm:p-4 text-right">

                  <div className="flex justify-end gap-2">

                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Eye size={16} />
                    </button>

                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Pencil size={16} />
                    </button>

                    <button className="p-2 hover:bg-green-100 text-green-600 rounded-lg">
                      <CheckCircle size={16} />
                    </button>

                    <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg">
                      <Trash2 size={16} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
      </>
  )
}