import { useCan } from 'hooks/useCan';

const Can = ({ children, perform }) => {
  const { can } = useCan();

  if (can(perform)) {
    return children;
  }

  return null;
};

export default Can;