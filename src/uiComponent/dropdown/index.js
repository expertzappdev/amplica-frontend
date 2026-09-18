import React from 'react';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Autocomplete from '@mui/material/Autocomplete';
import Circle from '@mui/icons-material/Circle';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import './style.css';  // Import the CSS file

const icon = <Circle fontSize='small' />;
const checkedIcon = <CheckBoxIcon  />;

const CustomTextField = (props) => {
  return (
    <TextField
      {...props}
      variant="outlined"
      fullWidth
      InputProps={{
        ...props.InputProps,
        startAdornment: null,
      }}
    />
  );
};

export default function ComboBox() {
  return (
    <>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={top100Films}
        className='dropdown'
        renderInput={(params) => (
          <CustomTextField
            {...params}
            label="Movie"
          />
        )}
      />
      <Autocomplete
        disablePortal
        className='dropdown'
        id="combo-box-demo"
        options={top100Films}
        renderInput={(params) => (
          <CustomTextField
            {...params}
            label={
              <span>
                <span className="customIconStyle">{icon}</span>
                Movie
              </span>
            }
          />
        )}
      />
      <Autocomplete
        multiple
        className='dropdown'
        id="checkboxes-tags-demo"
        options={films}
        disableCloseOnSelect
        getOptionLabel={(option) => option.title}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              // icon={icon}
              checkedIcon={checkedIcon}
              checked={selected}
            />
            {option.title}
          </li>
        )}

        renderInput={(params) => (
          <TextField {...params} label="Checkboxes" placeholder="Favorites" />
        )}
      />
    </>
  );
}

const top100Films = [
  { label: 'The Shawshank Redemption', year: 1994 },
  { label: 'The Godfather', year: 1972 },
  { label: 'The Godfather: Part II', year: 1974 },
  { label: 'The Dark Knight', year: 2008 },
  { label: '12 Angry Men', year: 1957 },
  { label: "Schindler's List", year: 1993 },
  { label: 'Pulp Fiction', year: 1994 },
];

const films = [
  { title: 'The Shawshank Redemption', year: 1994 },
  { title: 'The Godfather', year: 1972 },
  { title: 'The Godfather: Part II', year: 1974 },
  { title: 'The Dark Knight', year: 2008 },
  { title: '12 Angry Men', year: 1957 },
  { title: "Schindler's List", year: 1993 },
  { title: 'Pulp Fiction', year: 1994 },
];

