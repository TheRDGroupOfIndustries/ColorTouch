"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const WhatsAppCampaignPage = () => {
  const [form, setForm] = useState({
    campaignName: "",
    description: "",
    campaignType: "MARKETING",
    priority: "HIGH",
    messageType: "TEXT",
    messageContent: "",
    mediaURL: "",
    templateID: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) {
        toast.error("Failed to create campaign");
        return;
      }

      const data = await res.json();

      toast.success("✅ Campaign created successfully!");
      console.log("✅ Created Campaign:", data);
      
      // Reset form after successful creation
      setForm({
        campaignName: "",
        description: "",
        campaignType: "MARKETING",
        priority: "HIGH",
        messageType: "TEXT",
        messageContent: "",
        mediaURL: "",
        templateID: "",
      });
    } catch (error: any) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">WhatsApp Campaigns</h1>
        <p className="text-gray-400">
          Manage your WhatsApp campaigns and create new campaigns for your
          audience.
        </p>
      </div>

      {/* Form */}
      <div className="p-8 rounded-xl shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold">Create WhatsApp Campaign</h2>
        <p className="">Fill out the details below to create a new campaign.</p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Campaign Name */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Campaign Name</label>
            <input
              type="text"
              name="campaignName"
              value={form.campaignName}
              onChange={handleChange}
              placeholder="Enter campaign name"
              required
              className="p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter campaign description"
              rows={6}
              className="p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/80 transition resize-none"
            />
          </div>

          {/* Campaign Type & Priority */}
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium">Campaign Type</label>
              <select
                name="campaignType"
                value={form.campaignType}
                onChange={handleChange}
                className="p-3 rounded-lg bg-black border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
              >
                <option value="MARKETING">MARKETING</option>
                <option value="PROMOTIONAL">PROMOTIONAL</option>
                <option value="REMINDER">REMINDER</option>
                <option value="NOTIFICATION">NOTIFICATION</option>
                <option value="TRANSACTIONAL">TRANSACTIONAL</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="p-3 rounded-lg bg-black border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          {/* Message Type & Content */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Message Type</label>
            <select
              name="messageType"
              value={form.messageType}
              onChange={handleChange}
              className="p-3 rounded-lg bg-black border focus:outline-none focus:ring-2 focus:ring-primary/80 transition mb-2"
            >
              <option value="TEXT">TEXT</option>
              <option value="IMAGE">IMAGE</option>
              <option value="AUDIO">AUDIO</option>
              <option value="VIDEO">VIDEO</option>
              <option value="DOCUMENT">DOCUMENT</option>
              <option value="TEMPLATE">TEMPLATE</option>
            </select>

            <label className="mb-1 font-medium">Message Content</label>
            <textarea
              name="messageContent"
              value={form.messageContent}
              onChange={handleChange}
              placeholder="Enter your message"
              rows={4}
              required
              className="p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/80 transition resize-none"
            />
          </div>

          {/* Media URL & Template ID */}
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium">Media URL</label>
              <input
                type="text"
                name="mediaURL"
                value={form.mediaURL}
                onChange={handleChange}
                placeholder="Optional media URL"
                className="p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium">Template ID</label>
              <input
                type="text"
                name="templateID"
                value={form.templateID}
                onChange={handleChange}
                placeholder="Optional template ID"
                className="p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary bg-white text-black px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition"
            >
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppCampaignPage;