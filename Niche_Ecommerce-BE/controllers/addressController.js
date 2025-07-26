import Address from "../models/Address.js";

export const getAddresses = async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });
  res.json(addresses);
};

export const addAddress = async (req, res) => {
  const newAddress = new Address({
    user: req.user._id,
    text: req.body.text,
  });
  const saved = await newAddress.save();
  res.status(201).json(saved);
};

export const deleteAddress = async (req, res) => {
  await Address.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
