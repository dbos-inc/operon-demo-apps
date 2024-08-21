from datetime import datetime, timedelta, UTC
from typing import TypedDict
import requests
from dbos import DBOS
from schema import earthquake_tracker


class EarthquakeData(TypedDict):
    place: str
    magnitude: float
    timestamp: str

# Create SQLAlchemy engine


dbos = DBOS()

# Streamlit app
# def main():
#     st.title("Postgres Table Display")

#     query = "SELECT * FROM dbos.workflow_status"

#     # Fetch data
#     df = pd.read_sql(query, engine)


#     # Display the dataframe as a table
#     st.table(df)


@dbos.transaction()
def record_earthquake_data(data: EarthquakeData):
    DBOS.sql_session.execute(earthquake_tracker.insert().values(**data))

@dbos.communicator()
def get_earthquake_data() -> list[EarthquakeData]:
    # USGS API endpoint for earthquake data
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"

    # Get the current time and calculate one hour ago
    end_time = datetime.now(UTC)
    start_time = end_time - timedelta(hours=1)

    # Format times for the API request
    end_time_str = end_time.strftime("%Y-%m-%dT%H:%M:%S")
    start_time_str = start_time.strftime("%Y-%m-%dT%H:%M:%S")

    # Parameters for the API request
    params = {
        "format": "geojson",
        "starttime": start_time_str,
        "endtime": end_time_str,
        "minmagnitude": 2.0  # Only get earthquakes with magnitude 2.5 or greater
    }

    # Make the API request
    response = requests.get(url, params=params)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        earthquakes = []
        for item in data["features"]:
            earthquake: EarthquakeData = {
                "place": item["properties"]["place"],
                "magnitude": item["properties"]["mag"],
                "timestamp": item["properties"]["time"]
            }
            earthquakes.append(earthquake)
        return earthquakes
    else:
        raise Exception(f"Error fetching data from USGS: {response.status_code} {response.text}")



if __name__ == "__main__":
    earthquakes = get_earthquake_data()
    for e in earthquakes:
        print(e)
        record_earthquake_data(e)


