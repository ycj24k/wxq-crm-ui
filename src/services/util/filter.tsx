const filter = (inputValue: string, path: any[]) => {
  return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
};

export default filter;
