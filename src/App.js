import React from 'react';
import './App.css';
import SelectPlace from "./components/SelectPlace";
import TodayWeather from "./components/TodayWeather";
import WeatherForecastCards from "./components/WeatherForecastCards";
import SwitchTemperatureScale from "./components/SwitchTemperatureScale";

class App extends React.Component{
    constructor() {
        super()
        this.getDataFromApi = this.getDataFromApi.bind(this)
        this.cityNameQuery = this.cityNameQuery.bind(this)
        this.weatherQuery = this.weatherQuery.bind(this)
        // this.latLongQuery = this.latLongQuery.bind(this)
    }

    state = {
        apiAddress: '/api/location/',
        apiWeatherData : [],
        isRunningApiWeatherRequest: false,

        apiCitiesData : [],
        isRunningApiCitiesRequest: false,
        searchCity : '',

        temperatureScale: 'c'
    }

    // async componentDidMount() {
    //     if ("geolocation" in navigator) {
    //         navigator.geolocation.getCurrentPosition(function(position) {
    //             const {latitude:lat, longitude:long} = position.coords
    //             console.log(lat, long)
    //         })
    //         await this.getDataFromApi(this.latLongQuery)
    //     } else {
    //         console.log("Not Available");
    //     }
    // }


    ///////// GET DATA FROM API /////////
    async getDataFromApi (queryFunction, event){ // 'query', 'lattlong'
        // Api request
        const [response, storeLocalization] = await queryFunction(event)

        // Save data to state
        try {
            if (response.status === 200 && response.ok === true){
                const apiData = await response.json()
                this.setState({[storeLocalization] : apiData})
                console.log('Success get data')
            } else
                return Error(`Failed connect to API: ${response.status} ${response.statusText}`)
        } catch (error) {
            console.error(error)
        }

    }

    async cityNameQuery(){
        const {apiAddress, searchCity} = this.state

        this.setState({isRunningApiCitiesRequest:true})
        const apiResponse = await fetch(`${apiAddress}search/?query=${searchCity.trim()}`)
        this.setState({isRunningApiCitiesRequest:false})

        return [apiResponse, 'apiCitiesData']
    }

    async weatherQuery(event){
        // Restart search engine data
        this.setState({searchCity:'', apiCitiesData:''})

        const key = event.target.dataset.key
        const apiAddress = this.state.apiAddress

        this.setState({isRunningApiWeatherRequest:true})
        const apiResponse = await fetch(`${apiAddress}${key}/`)
        this.setState({isRunningApiWeatherRequest:false})

        return [apiResponse, 'apiWeatherData']
    }


    // async latLongQuery(lat, long){
    //     const {apiAddress} = this.state
    //
    //     this.setState({isRunningApiCitiesRequest:true})
    //     const apiLatLongResponse = await fetch(`${apiAddress}search/?lattlong=51.919438,19.145136`)
    //     this.setState({isRunningApiCitiesRequest:false})
    //     const woeid = await apiLatLongResponse.json()[0].woeid
    //
    //     await this.getDataFromApi()
    //     console.log(jsonResponse)
    //     return [apiResponse, 'apiCitiesData']
    // }

    /////////////////////////////////////

    handleChange = (event) => {
        const {name, value} = event.target
        this.setState({[name]: value})
    }

    //////////// TEMPERATURE ////////////

    convertTemperature = (centigradeTemperature) => {
        // Output => [TemperatureInSelectedScale, SelectedScaleMark]
        if (this?.state?.temperatureScale === undefined) return Error("No data in temperatureScale stata")
        if (centigradeTemperature === undefined) return Error("convertTemperature don't get any parameter")

        centigradeTemperature = parseFloat(centigradeTemperature)
        if (this.state.temperatureScale === "c") return [Math.round(centigradeTemperature), '°C']
        if (this.state.temperatureScale === "f") return [Math.round(centigradeTemperature * 9/5) + 32, '°F']
    }

    render(){
        // Todo load weather data animation
        const selectLocalizationPack = {
            inputValue : this.state.searchCity,
            apiCitiesData: this.state.apiCitiesData,
            isRunningApiCitiesRequest: this.state.isRunningApiCitiesRequest,
            handleChange: this.handleChange,
            getDataFromApi: this.getDataFromApi,
            cityNameQuery: this.cityNameQuery,
            weatherQuery: this.weatherQuery,
        }

        return (
            <div className="App">
                <aside>
                    <SelectPlace data={selectLocalizationPack}/>
                    {
                        this.state?.apiWeatherData?.consolidated_weather?.[0] !== undefined
                        ? <TodayWeather
                                data={this.state.apiWeatherData}
                                convertTemperature = {this.convertTemperature} />
                        : <p> Can't load data </p>
                    }
                </aside>
                <main>
                    <SwitchTemperatureScale data={{
                        handleChange: this.handleChange,
                        selectedTemperatureScale: this.state.temperatureScale
                    }}/>
                    {
                        this.state?.apiWeatherData?.consolidated_weather?.[5] !== undefined
                        ? <WeatherForecastCards
                                data = {this.state.apiWeatherData}
                                convertTemperature = {this.convertTemperature} />
                        : <p> Can't load data </p>
                    }
                </main>
            </div>
        )
    }
}

export default App;
