import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import "./style.css";
import UseFormControl from 'uiComponent/input/input';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl';
const ProfileField = ({ title, value, editable, onChange, type, options, error, state, city, nationality , maxLength}) => {
  console.log("value",value)
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
      return ''; // Return an empty string if phoneNumber is undefined or null
    }

    // Extract country code and phone number
    const countryCode = phoneNumber.substring(2, phoneNumber.indexOf(' '));
    const restNumber = phoneNumber.substring(phoneNumber.indexOf(' ') + 3);

    // Add a space between the country code and phone number
    return `+${countryCode} ${restNumber}`;
  };
  return (
    <div className="field-container">
      <div style={{ marginTop: editable ? '15px' : '0' }}>
        <span className="field-title bJvZsc">{title}</span>
      </div>
      {editable ? (
        <div className="field-content">
          {type === 'select' ? (
            <FormControl fullWidth >
              <Select
                // className="field-input"
                value={value}
                onChange={onChange}
              >
                {options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select></FormControl>
          ) : type === 'phone' ? (
            <div className="mobile-no ">
              <PhoneInput

                country={'in'}
                value={value}
                onChange={(phoneNumber) => onChange({ target: { value: phoneNumber }, name: 'phone' })}
              /> 
                 {error && <span className="error-message">{error}</span>}</div>
          ) : type === 'nationality' ? (
            // New country dropdown logic
            <FormControl fullWidth>
              <Select value={value} onChange={(e) => onChange(e, title)}  renderValue={(selected) => {
                if (typeof selected === 'object' && selected !== null) {
                  return selected.name; // Display the country name if an object is selected
                }
                return selected; // Display the value as is if not an object
              }}>

                {nationality && nationality.map((nationality) => (
                  <MenuItem key={nationality.nationalityId} value={{ id: nationality.nationalityId, name: nationality.nationalityName }}>
                    {nationality.nationalityName
                    }
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : type === 'country' ? (
            // New country dropdown logic
            <FormControl fullWidth>
              <Select value={value} onChange={(e) => onChange(e, title)} renderValue={(selected) => {
                if (typeof selected === 'object' && selected !== null) {
                  return selected.name; // Display the country name if an object is selected
                }
                return selected; // Display the value as is if not an object
              }}>

                {options && options.map((country) => (
                  <MenuItem key={country.id} value={{ id: country.id, name: country.name }}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : type === 'state' ? (
            // New country dropdown logic
            <FormControl fullWidth>
              <Select value={value} onChange={(e) => onChange(e, title)}
                renderValue={(selected) => {
                  if (typeof selected === 'object' && selected !== null) {
                    return selected.name; // Display the state name if an object is selected
                  }
                  return selected; // Display the value as is if not an object
                }}
              >

                {state && state.map((state) => (
                  <MenuItem key={state.id} value={{ id: state.id, name: state.name }}>
                    {state.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : type === 'city' ? (
            // New country dropdown logic
            <FormControl fullWidth>
              <Select value={value} onChange={(e) => onChange(e, title)}
                renderValue={(selected) => {
                  if (typeof selected === 'object' && selected !== null) {
                    return selected.name; // Display the state name if an object is selected
                  }
                  return selected;
                }}// Display the value as is if not an object
              >

                {city && city.map((city) => (
                  <MenuItem key={city.id} value={{ id: city.id, name: city.name }}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <UseFormControl
              // className="field-input"
              type={type}
              value={value}
              onChange={onChange}
              error={!!error}
              helperText={error}
              maxLength={maxLength}
            />
          )}
        </div>
      ) : (
        <div className="field-content">
          {type === 'phone' ? (
            <span className="field-value">{formatPhoneNumber(value)}</span>
          ) : (
            <span className="field-value">{value}</span>
          )}
        </div>
      )}
      <div className="field-footer"></div>
    </div>
  );
};
export default ProfileField;