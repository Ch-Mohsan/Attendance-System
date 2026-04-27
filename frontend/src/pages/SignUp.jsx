import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";
import { toastApiPromise, toastError } from "../utils/notify";

export default function SignUp() {
  const [form, setForm] = useState({
    username: "",
    contact: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.username) errs.username = "UserName is required";
    if (!form.contact) errs.contact = "Contact is required";
    if (!form.email) errs.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      try {
        await toastApiPromise(api.post("/users/register", form), {
          pending: "Creating account...",
          success: "Account created. Please sign in.",
        });
        navigate("/login");
      } catch (err) {
        const message = getApiErrorMessage(err, "Sign up failed");
        setErrors({ api: message });
        toastError(message);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-lg shadow animate-fade-in">
      <h2 className="text-2xl font-bold text-black mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-black font-semibold">UserName</label>
          <input name="username" value={form.username} onChange={handleChange} className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>
        <div>
          <label className="block text-black font-semibold">Contact</label>
          <input name="contact" value={form.contact} onChange={handleChange} className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
          {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
        </div>
        <div>
          <label className="block text-black font-semibold">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-black font-semibold">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-black font-semibold">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="Owner">Owner</option>
            <option value="Student">Student</option>
          </select>
        </div>
        {errors.api && <p className="text-red-500 text-sm">{errors.api}</p>}
        <button type="submit" className="w-full bg-orange-500 text-white font-bold py-2 rounded hover:bg-black hover:text-orange-500 transition">Sign Up</button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-orange-500 hover:underline">Login</Link>
      </p>
    </div>
  );
}