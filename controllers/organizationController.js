// organizationController.js

const Organization = require("../models/organization");

// Service for organization-related operations

const organizationService = {
  getAllOrganizations: async () => {
    try {
      return await Organization.find();
    } catch (err) {
      throw new Error(err.message);
    }
  },

  getOrganizationById: async (id) => {
    try {
      return await Organization.findById(id);
    } catch (err) {
      throw new Error(err.message);
    }
  },

  createOrganization: async (organizationData) => {
    try {
      const organization = new Organization(organizationData);
      return await organization.save();
    } catch (err) {
      throw new Error(err.message);
    }
  },

  updateOrganization: async (id, organizationData) => {
    try {
      return await Organization.findByIdAndUpdate(id, organizationData, {
        new: true,
      });
    } catch (err) {
      throw new Error(err.message);
    }
  },

  deleteOrganization: async (id) => {
    try {
      return await Organization.findByIdAndDelete(id);
    } catch (err) {
      throw new Error(err.message);
    }
  },
};

// Controller for handling organization-related operations

const organizationController = {
  getAllOrganizations: async (req, res) => {
    try {
      const organizations = await organizationService.getAllOrganizations();
      res.json(organizations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getOrganizationById: async (req, res) => {
    try {
      const organization = await organizationService.getOrganizationById(
        req.params.id
      );
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(organization);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createOrganization: async (req, res) => {
    try {
      const organization = await organizationService.createOrganization(
        req.body
      );
      res.status(201).json(organization);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  updateOrganization: async (req, res) => {
    try {
      const organization = await organizationService.updateOrganization(
        req.params.id,
        req.body
      );
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(organization);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteOrganization: async (req, res) => {
    try {
      const organization = await organizationService.deleteOrganization(
        req.params.id
      );
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json({ message: "Organization deleted successfully" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = organizationController;
