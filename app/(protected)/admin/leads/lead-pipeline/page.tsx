"use client"
import { Header } from "@/components/header"
import React, { useState } from "react"
import { Mail, Phone } from "lucide-react"
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"

type Lead = {
  id: number
  name: string
  email: string
  phone: string
  status: string
}

const initialLeads: Lead[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john@techsolutions.com",
    phone: "+1 234 567 890",
    status: "New",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@creativeagency.com",
    phone: "+1 555 212 789",
    status: "Contacted",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@globalmarketing.com",
    phone: "+1 555 678 234",
    status: "Qualified",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@startuphub.com",
    phone: "+1 555 998 123",
    status: "Proposal Sent",
  },
  {
    id: 5,
    name: "David Lee",
    email: "david@enterprise.com",
    phone: "+1 555 345 876",
    status: "Negotiation",
  },
]

const statuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
]

/* ---------------- Lead Card UI (Reusable) ---------------- */

function LeadCardUI({ lead }: { lead: Lead }) {
  return (
    <div className="bg-white border rounded-lg p-3 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
          {lead.name.charAt(0)}
        </div>

        <div>
          <p className="font-medium text-sm">{lead.name}</p>
          <p className="text-xs text-gray-400">Lead #{lead.id}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <Mail size={14} />
        {lead.email}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Phone size={14} />
        {lead.phone}
      </div>
    </div>
  )
}

/* ---------------- Draggable Card ---------------- */

function LeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab"
    >
      <LeadCardUI lead={lead} />
    </div>
  )
}

/* ---------------- Droppable Column ---------------- */

function Column({
  status,
  leads,
}: {
  status: string
  leads: Lead[]
}) {
  const { setNodeRef } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      className="w-[280px] bg-gray-50 rounded-xl border flex flex-col max-h-[75vh]"
    >
      <div className="p-4 border-b bg-white rounded-t-xl flex justify-between items-center">
        <h3 className="font-semibold text-sm">{status}</h3>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
          {leads.length}
        </span>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}

        {leads.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-6">
            No leads
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- Main Component ---------------- */

export default function LeadsPipeline() {
  const [leads, setLeads] = useState(initialLeads)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const leadId = Number(event.active.id)
    const found = leads.find((lead) => lead.id === leadId) || null
    setActiveLead(found)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) {
      setActiveLead(null)
      return
    }

    const leadId = Number(active.id)
    const newStatus = String(over.id)

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, status: newStatus }
          : lead
      )
    )

    setActiveLead(null)
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Leads-pipeline" },
        ]}
      />

      <div className="p-6 w-full">

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Lead Pipeline</h1>
          <p className="text-gray-500 text-sm">
            Visualize and manage your sales pipeline
          </p>
        </div>

        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="w-full overflow-x-auto">
            <div className="flex gap-6 min-w-max pb-4">
              {statuses.map((status) => {
                const columnLeads = leads.filter(
                  (lead) => lead.status === status
                )

                return (
                  <Column
                    key={status}
                    status={status}
                    leads={columnLeads}
                  />
                )
              })}
            </div>
          </div>

          {/* 🔥 Drag Overlay Fix */}
          <DragOverlay>
            {activeLead ? (
              <div className="scale-105 shadow-2xl">
                <LeadCardUI lead={activeLead} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  )
}