
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
export default function UseFormControl(props) {
  const {
    name,
    label,
    type,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    id,
    endAdornment,
    maxLength
  } = props;

  return (
    <>
    <InputLabel htmlFor={id}>{label}</InputLabel>
    <OutlinedInput
     fullWidth
      id={id}
      type={type || 'text'} // Default to 'text' if type is not provided
      value={value}
      name={name}
      onBlur={onBlur}
      onChange={(e) => onChange(e)}
      label={label}
      inputProps={{ maxLength: maxLength }}
      endAdornment={endAdornment}
     
    />
    {error && (
      <FormHelperText error id={`standard-weight-helper-text-${name}`}>
        {helperText}
      </FormHelperText>
    )}
    </>
  );
}