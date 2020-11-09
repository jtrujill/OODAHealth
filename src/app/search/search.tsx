import React, {FC, useEffect, useState} from 'react';
import axios from 'axios';
import {
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import {useHistory, useLocation} from 'react-router-dom';
import queryString from 'query-string';
import {equals, fromPairs, isEmpty, isNil, pipe, reject, toPairs} from 'ramda';

const corsProxy = 'https://cors-anywhere.herokuapp.com';
const baseNPIUrl = 'https://npiregistry.cms.hhs.gov/api?version=2.1';

type ToastEventType = React.MouseEvent<HTMLElement> | React.SyntheticEvent<any>;

function initSearch(location: any) {
  const search = queryString.parse(location.search) as any;
  return {
    searchOrg: false,
    organization: search.organization || '',
    firstName: search.firstName || '',
    lastName: search.lastName || ''
  };
}

const Search: FC = () => {
  const location = useLocation();
  const history = useHistory();
  const [errorState, setErrorState] = useState({show: false, message: ''});
  const [searchState, setSearchState] = useState(initSearch(location));
  const [npiState, setNpiState] = useState({isLoading: false, npiList: []});

  useEffect(() => {
    searchNPI();
  }, []);

  const getNPIQueryArg = () => {
    let npiSearch: Record<string, unknown>;
    if (searchState.searchOrg) {
      npiSearch = {
        organization: searchState.organization
      };
    } else {
      npiSearch = {
        first_name: searchState.firstName,
        last_name: searchState.lastName
      };
    }
    const filteredSearch = filterSearchState(npiSearch);
    return isEmpty(filteredSearch) ? '' : queryString.stringify(filteredSearch);
  };

  const searchNPI = (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    const queryArgs = getNPIQueryArg();
    if (!queryArgs) {
      return;
    }
    setNpiState({...npiState, isLoading: true});
    axios
      .get(`${corsProxy}/${baseNPIUrl}&${queryArgs}`)
      .then((npi: any) => {
        const reducedView = createReducedView(npi.data);
        setNpiState({isLoading: false, npiList: reducedView});
      })
      .catch((e) => {
        setErrorState({show: true, message: 'Failed to fetch NPI data'});
        setNpiState({...npiState, isLoading: false});
      });
  };

  const createReducedView = (npiJson: any) => {
    return npiJson.results.map((npiData: any) => {
      const basic = npiData.basic;
      return {
        number: npiData.number,
        firstName: basic.first_name,
        lastName: basic.last_name,
        organization: basic.organization_name
      };
    });
  };

  const filterSearchState = pipe(
    toPairs,
    reject<any, 'array'>(([k, v]) => {
      return equals(k, 'searchOrg') || isNil(v) || isEmpty(v);
    }),
    fromPairs
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetName = event.target.name;
    if (targetName === 'searchOrg') {
      setSearchState({...searchState, [targetName]: event.target.checked});
    } else {
      const newSearchState = {...searchState, [targetName]: event.target.value};
      const filteredSearch = filterSearchState(newSearchState);
      const query = queryString.stringify(filteredSearch);
      history.replace({...history.location, search: query});
      setSearchState(newSearchState);
    }
  };

  const handleCloseSnack = () => {
    setErrorState({show: false, message: ''});
  };

  const renderTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table aria-label="NPI List">
          <TableHead>
            <TableRow>
              <TableCell align="right">Organization</TableCell>
              <TableCell align="right">First name</TableCell>
              <TableCell align="right">Last name</TableCell>
              <TableCell align="right">NPI number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {npiState.npiList.map((row: any) => (
              <TableRow key={row.number}>
                <TableCell component="th" scope="row">
                  {row.organization}
                </TableCell>
                <TableCell align="right">{row.firstName}</TableCell>
                <TableCell align="right">{row.lastName}</TableCell>
                <TableCell align="right">{row.number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div>
      <Switch checked={searchState.searchOrg} onChange={handleChange} name="searchOrg" />

      <div>
        <form noValidate autoComplete="off" onSubmit={(e) => searchNPI(e)}>
          {searchState.searchOrg ? (
            <TextField
              label="Organization Search"
              name="organization"
              onInput={handleChange}
              value={searchState.organization}
            />
          ) : (
            <>
              <TextField label="First name" name="firstName" onInput={handleChange} value={searchState.firstName} />
              <TextField label="Last name" name="lastName" onInput={handleChange} value={searchState.lastName} />
            </>
          )}
          <Button variant="contained" color="primary" type="submit" onClick={() => searchNPI()}>
            Search
          </Button>
        </form>
      </div>

      <div>{npiState.isLoading ? <CircularProgress /> : renderTable()}</div>

      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={errorState.show}
        autoHideDuration={3000}
        onClose={handleCloseSnack}
        message={errorState.message}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnack}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  );
};

export {Search};
