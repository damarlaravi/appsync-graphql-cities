import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView
} from 'react-native'
import AllCities from './queries/AllCities'
import NewCitiesSubscription from './subscriptions/NewCitySubscription';
import { compose, graphql } from 'react-apollo'
import { ListItem } from 'react-native-elements'
import { StackNavigator } from 'react-navigation'
import City from './City'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  headerImage: {
    width: '100%',
    height: 40
  },
  listItem: {
    borderBottomColor: '#ededed'
  }
})

class Cities extends React.Component {
  static navigationOptions = {
    headerTitle: (
      <Image
        resizeMode='contain'
        style={styles.headerImage}
        source={require('./assets/citieslogo.png')}
      />
    )
  }
  componentWillMount(){
    this.props.subscribeToNewCities();
  }
  navigate(city) {
    this.props.navigation.navigate('City', { city })
  }
  render() {
    const { cities } = this.props
    return (
      <ScrollView>
        <View style={styles.container}>
          {
            cities.map((city, index) => (
              <ListItem
                containerStyle={styles.listItem}
                onPress={() => this.navigate(city)}
                key={index}
                title={city.name}
                subtitle={city.country}
              />
            ))
          }
        </View>
      </ScrollView>
    )
  }
}

const CitiesWithData = compose(
  graphql(AllCities, {
      options: {
        fetchPolicy: 'cache-and-network'
      },
      props: (props) => {
        return {
          cities: props.data.allCity ? props.data.allCity.cities : [],
          subscribeToNewCities: params => {
            props.data.subscribeToMore({
                document: NewCitiesSubscription,
                updateQuery: (prev, { subscriptionData: { data : { putCity } } }) => {
                  return {
                    ...prev,
                    allCity: { __typename: 'City', cities: [putCity, ...prev.allCity.cities.filter(city => city.id !== putCity.id)]}
                }
              }
            });
          }
        }
      }
  })
)(Cities)

const routes = {
  CitiesWithData: {
    screen: CitiesWithData
  },
  City: {
    screen: City
  }
}

const config = {
  navigationOptions: {
    headerTintColor: 'white',
    headerStyle: {
      backgroundColor: '#0091EA'
    },
    headerTitleStyle: {
      color: 'white'
    }
  }
}

export default StackNavigator(routes, config)