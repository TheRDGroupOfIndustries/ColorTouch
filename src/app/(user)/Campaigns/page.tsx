"use client";

import React, { useState } from "react";

const WhatsAppCampaignPage = () => {
  const [form, setForm] = useState({
    campaignName: "",
    description: "",
    campaignType: "Marketing",
    priority: "Normal",
    messageType: "Text",
    messageContent: "",
    mediaURL: "",
    templateID: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Campaign Data:", form);
    alert("Campaign Created! Check console for data.");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">WhatsApp Campaigns</h1>
        <p className="text-gray-400">
          Manage your WhatsApp campaigns and create new campaigns for your audience.
        </p>
      </div>

      {/* Form */}
      <div className="  p-8 rounded-xl   shadow-lg space-y-6">
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
              className="p-3 rounded-lg  border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
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
                <option value="Marketing">Marketing</option>
                <option value="Promotion">Promotion</option>
                <option value="Reminder">Reminder</option>
                <option value="Notifications">Notifications</option>
                <option value="Transactionsal">Transactionsal</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="p-3 rounded-lg bg-black border  focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
              >
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
                <option value="Urgent">Urgent</option>
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
              <option value="Text">Text</option>
              <option value="Media">Media</option>
              <option value="Image">Image</option>
              <option value="Voice">Voice</option>
              <option value="Video">Video</option>
              <option value="Document">Document</option>
              <option value="Template">Template</option>
            </select>

            <label className="mb-1 font-medium">Message Content</label>
            <textarea
              name="messageContent"
              value={form.messageContent}
              onChange={handleChange}
              placeholder="Enter your message"
              rows={4}
              className="p-3 rounded-lg  border focus:outline-none focus:ring-2 focus:ring-primary/80 transition resize-none"
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
                className="p-3 rounded-lg border  focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
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
                className="p-3 rounded-lg  border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
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
