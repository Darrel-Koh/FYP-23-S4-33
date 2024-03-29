import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Snackbar } from '@mui/material';
import { grey } from '@mui/material/colors';
import "../components/style.css";
import AuthContext from './AuthContext';
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';

const ViewTickers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults, searchTerm } = location.state || {};
  const [currentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
 // eslint-disable-next-line no-unused-vars
  const endIndex = startIndex + itemsPerPage;
  const [relatedNews, setRelatedNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [favList, setFavList] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const { userId } = useContext(AuthContext);
  const [lastListAdded, setLastListAdded] = useState(false);
   const [isSnackbarOpen, setIsSnackbarOpen] = useState(false); // State for Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Message for the Snackbar
  const [plotImageUrl, setPlotImageUrl] = useState(null);
  
  const fetchUserData = async () => {
    try {
      if (!userId) {
        setFavList([]);
        return;
      }
  
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/my-ticker/${encodeURIComponent(userId)}`);
  
      if (!response.data) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }
  
      const userData = response.data;
  
      // Check user account type
      if (userData.account_type === 'Basic') {
        // If user is Basic, retrieve only the first index in the array
        setFavList(userData.favList && userData.favList.length > 0 ? [userData.favList[0]] : []);
      } else {
        // If user is not Basic, retrieve everything
        setFavList(userData.favList || []);
      }
  
      const filteredID = Array.isArray(searchResults) ? searchResults : [searchResults];
      
      console.log('filteredID:', filteredID);
      const availableLists = userData.favList.filter((list) => !list.tickers.includes(filteredID[0]._id));
      setSelectedList(availableLists.length > 0 ? availableLists[0].list_name : null);
      
  
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPlotData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/mainPage/search/${searchTerm}`); // Adjust the URL according to your API endpoint
      if (!response.data) {
        throw new Error('No plot data available');
      }
      console.log(response.data);
      const plotData = response.data.plot_data;
      // console.log(plotData);
      if (plotData) {
        const imageUrl = `data:image/png;base64,${plotData}`;
        setPlotImageUrl(imageUrl);
      } else {
        console.log('Plot data not found in the response');
      }
    } catch (error) {
      console.error('Error fetching plot data:', error);
    }
  };

  
  

  useEffect(() => {
    console.log('Fetching related news for:', searchTerm);
    const apiKey = '9281952933294c1db4cd37047165cae3';

    const fetchRelatedNews = async () => {
      try {
        const stocksKeywords = ['stocks', 'financial'];
        const searchTermWithKeywords = `${searchTerm} ${stocksKeywords.join(' OR ')}`;
        const url = `https://newsapi.org/v2/everything?q=${searchTermWithKeywords}&apiKey=${apiKey}&language=en`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const limitedNews = data.articles.slice(0, 3);

        setRelatedNews(limitedNews);
      } catch (error) {
        console.error('Error fetching related news:', error);
      } finally {
        console.log('Finished fetching related news');
        setLoadingNews(false);
      }
    };

    if (searchTerm) {
      fetchRelatedNews();
    }
    fetchUserData();
    fetchPlotData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, searchTerm]);

  useEffect(() => {
    
  }, [searchResults, searchTerm]);

  const handleAddToFavourite = async (recordId, recordIdName) => {
    
    const availableLists = favList.filter((list) => !list.tickers.includes(recordId));
    try {
      if (!userId) {
        throw new Error('Invalid user');
      }
      
      let listToAdd = selectedList;
      setIsSnackbarOpen(true);
      setSnackbarMessage(`Added ${recordIdName} to ${selectedList}`);
  
      if (!listToAdd) {
        throw new Error('No list selected or no available lists');
      }
      
      if (!selectedList || !availableLists.some(list => list.list_name === selectedList)) {
        // Set selectedList to the first available list
        setSelectedList(availableLists[0].list_name);
        console.log('No list selected or selected list not available. Using the first available list:', availableLists[0].list_name);
      } else {
        console.log('List selected:', selectedList);
      }      
      
      if (availableLists.length === 1) {
        listToAdd = availableLists[0].list_name;
        console.log('Only one available list:', listToAdd);
        setLastListAdded(true);
      } else if (availableLists.length > 1) {
        // Use the first available list if none is selected, otherwise use the selectedList
        listToAdd = selectedList;
        console.log('List selected:', listToAdd);
        setLastListAdded(false);
      }      
     
      console.log('Adding record to list:', listToAdd);
      console.log('Record ID name:', recordIdName);

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/my-ticker/update/${encodeURIComponent(userId)}/${encodeURIComponent(listToAdd)}`,
        { tickerId: recordId }
      );

      setSelectedList(selectedList);

      setTimeout(() => {
        window.location.reload();
      }, 2000);

      if (!response.data) {
        throw new Error('Failed to update ticker details');
      }
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 409) {
        window.alert(`Error: ${data.error}`);
      } else if (status === 404) {
        console.log(`Error: ${data}`);
      } else if (status === 500) {
        console.log(`Server Error: ${data}`);
      } else {
        console.log(`Unexpected response status: ${status}`);
      }
    } else {
      console.log('Error adding record to the list:', error.message);
    }
  }
};

const handleListSelection = (selectedList) => {
  setSelectedList(selectedList);
};

const formatTo3SF = (number) => {
  if (number === null || isNaN(number)) {
    return '-';
  }

  // Convert to a number with 3 significant figures
  const formattedNumber = Number.parseFloat(number).toPrecision(3);

  return formattedNumber;
};

const renderListDropdown = (result) => {
  if (favList.length === 0) {
    return <p>No list available</p>;
  }

  const listsWithResult = favList.filter((list) => list.tickers.includes(result._id));

  if (listsWithResult.length === favList.length) {
    // Hide "Add to List" button when "All List has this Ticker. No list available to choose." is displayed
    return <p>All List has this Ticker. No list available to choose.</p>;
  }

  const availableLists = favList.filter((list) => !listsWithResult.some((l) => l.list_name === list.list_name));

  // Find the first available list that does not have result._id
  const firstAvailableList = availableLists.find((list) => !list.tickers.includes(result._id));

  return (
    <div style={{ position: 'relative', marginBottom: '10px' }}>
      <select
        onChange={(e) => handleListSelection(e.target.value)}
        value={selectedList || (firstAvailableList ? firstAvailableList.list_name : '')}
        style={{ position: 'absolute', marginLeft: '15px', top: 0 }}
      >
        {availableLists.map((list) => (
          <option key={list.list_name} value={list.list_name}>
            {list.list_name}
          </option>
        ))}
      </select>
      <Button
        onClick={() => handleAddToFavourite(result._id, result.trading_name)}
        variant="contained"
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: '25px', // Adjust the marginTop to align the button and dropdown
          backgroundColor: '#FFD700',
          color: 'black',
          alignContent: 'center'
        }}
      >
        Add to Favourite
      </Button>
    </div>
  );
  
          };  



  const renderTable = () => {
    // Wrap the single object in an array if it's not already an array
    const dataArray = Array.isArray(searchResults) ? searchResults : [searchResults];
  
    if (dataArray.length === 0) {
      return <Typography variant="body1" style={{ marginTop: '10px' }}>No data available for the search term: {searchTerm}</Typography>;
    }

    return (
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={tableHeaderStyle}>Trading Name</TableCell>
              <TableCell style={tableHeaderStyle}>Symbol</TableCell>
              <TableCell style={tableHeaderStyle}>Transaction Date</TableCell>
              <TableCell style={tableHeaderStyle}>Adj Close</TableCell>
              <TableCell style={tableHeaderStyle}>Volume</TableCell>
              <TableCell style={tableHeaderStyle}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataArray.map((result, index) => (
              <TableRow key={result._id} style={{ background: index % 2 === 0 ? grey[200] : 'white' }}>
                <TableCell style={tableCellStyle}>{result.trading_name}</TableCell>
                <TableCell style={tableCellStyle}>{result.symbol}</TableCell>
                <TableCell style={tableCellStyle}>
                  {result.transactions.length > 0 && result.transactions[result.transactions.length - 1].Date}
                </TableCell>
                <TableCell style={tableCellStyle}>
                  {result.transactions.length > 0 && formatTo3SF(result.transactions[result.transactions.length - 1]['Adj Close'])}
                </TableCell>
                <TableCell style={tableCellStyle}>
                  {result.transactions.length > 0 && result.transactions[result.transactions.length - 1].Volume}
                </TableCell>
                <TableCell style={tableCellStyle}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '10px' }}>
                    {lastListAdded ? (
                      <p>Last List added, No More list available</p>
                    ) : (
                      renderListDropdown(result)
                    )}
                  </div>
                </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderRelatedNews = () => {
    return (
      <div style={{ marginTop: '50px' }}>
        <Typography variant="h6" style={{ marginBottom: '20px' }}>Related News</Typography>
        {loadingNews ? (
          <CircularProgress />
        ) : Array.isArray(relatedNews) && relatedNews.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {relatedNews.map((article, index) => (
              <li key={index} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
                <Typography variant="h6">{article.title}</Typography>
                <Typography variant="body1" style={{ margin: '10px 0 0' }}>{article.description}</Typography>
                <Link href={article.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '10px', color: '#007BFF', textDecoration: 'underline' }}>
                  Read More
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="body1">No related news available.</Typography>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
        <Button onClick={() => navigate('/mainPage')} variant="contained" style={returnButtonStyle}>
          Return to Main Page
        </Button>
      </div>
      
      <div>
        {/* {loading ? (
          <CircularProgress />
        ) : plotImageUrl ? (
          <img src={plotImageUrl} alt="Plot" />
        ) : (
          <Typography variant="body1">No plot data available.</Typography>
        )} */}
        <img src={plotImageUrl} alt="Currently Unavailable" />
      </div>

      {renderTable()}
      {searchTerm && renderRelatedNews()}
      

      <footer className="footer">
        <Typography variant="body2">&copy; 2023 Bulls Ai. All rights reserved.</Typography>
      </footer>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarOpen(false)}
        >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setIsSnackbarOpen(false)}
          severity="success"
        >
          {snackbarMessage}
        </MuiAlert>
        </Snackbar>

    </div>

  );
  
};



const tableHeaderStyle = {
  padding: '10px',
  textAlign: 'center',
  fontWeight: 'bold',
};

const tableCellStyle = {
  padding: '10px',
  textAlign: 'center',
};

const returnButtonStyle = {
  backgroundColor: grey[400],
  color: 'black',
  padding: '10px 15px',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default ViewTickers;