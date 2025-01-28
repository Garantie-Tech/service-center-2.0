"use client";

type InputFieldProps = {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
    />
  </div>
);

export default InputField;
