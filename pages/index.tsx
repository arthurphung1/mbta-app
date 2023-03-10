import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useContext } from 'react';
import Dropdown from '../components/Dropdown';
import { IStops } from '../interfaces/IStops';
import styles from '../styles/Home.module.css';
import { RouteTypesMapContext } from './_app';
import { IDropdownOption } from '../interfaces/IDropdownOption';

export default function Home() {
    const router = useRouter();
    const routeTypesMapContext = useContext(RouteTypesMapContext);

    // routeTypesList = array of route types
    const [routeTypesList, setRouteTypesList] = useState<Array<IDropdownOption>>([]);
    // routeType = selected route type
    const [routeType, setRouteType] = useState<string>();
    // routesList = array of routes for a specific route type
    const [routesList, setRoutesList] = useState<Array<IDropdownOption>>([]);
    // route = selected route
    const [route, setRoute] = useState<string>();
    // stopsList = array of stops for a specific route
    const [stopsList, setStopsList] = useState<Array<IDropdownOption>>([]); 
    // category = current category list
    const [showRoutes, setShowRoutes] = useState<Boolean>(false);
    const [showStops, setShowStops] = useState<Boolean>(false);

    useEffect(() => {
        const routesList: Array<IDropdownOption> = [];

        if (routeTypesMapContext) {
            for (const key in routeTypesMapContext) {
                const dropdownOption: IDropdownOption = { 'value': key.toLowerCase(), 'label': key };
                routesList.push(dropdownOption);
            }
        }

        setRouteTypesList(routesList);
    }, [routeTypesMapContext])

    const handleRouteType = (option: IDropdownOption) => {
        // Get selected route type and update routesList
        const routesList: Array<IDropdownOption> = [];
        routeTypesMapContext[option.label].forEach((route) => routesList.push({ 'value': route.id, 'label': route.attributes.long_name }));
        setRoutesList(routesList);
        setRouteType(option.label);
        setShowRoutes(true);
    }

    const handleRoute = async (option: IDropdownOption) => {
        // Get selected route and find associated route id
        const route: IDropdownOption | undefined = routesList.find((route) => route.value === option.value);
        // Retrieve stops for selected route using route id
        if (route !== undefined) {
            setRoute(route.value);
            const stopsResponse = await fetch(`/api/stops/${route.value}`);
            const stopsData: IStops = await stopsResponse.json();
            const stopsList: Array<IDropdownOption> = [];
            stopsData.data.forEach((stop) => stopsList.push({ 'value': stop.id, 'label': stop.attributes.name }));
            setStopsList(stopsList);
            setShowStops(true);
        } else {
            throw Error(`Unable to find selected route: ${option}`);
        }
    }

    const handleStop = (option: IDropdownOption) => {
        // Get selected stop and navigate user to tracking page with stop id parameter
        const stop: IDropdownOption | undefined = stopsList.find((stop) => stop.value === option.value);
        if (stop !== undefined) {
            router.push({
                pathname: `/predictions/${stop.value}`,
                query: { routeType: routeType, routeId: route }
            });
        } else {
            throw Error(`Unable to find seleced stop: ${option}`);
        }
    };

    return (
        <>
            <Head>
                <title>MBTA Tracker</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div className={styles.container}>
                    <div className={styles.items}>
                        <div className={styles['items-header']}>
                            <p>Find your current location</p>
                            <hr />
                        </div>
                        <div className={styles['items-body']}>
                            <Dropdown 
                                placeholder='Select Route Type' 
                                options={routeTypesList} 
                                isMulti={false}
                                isSearchable={true}
                                onChange={handleRouteType}
                                layer='third'
                            />
                            {showRoutes &&
                                <Dropdown 
                                    placeholder='Select Route'
                                    options={routesList}
                                    isMulti={false}
                                    isSearchable={true}
                                    onChange={handleRoute}
                                    layer='second'
                                />
                            }
                            {showStops &&
                                <Dropdown 
                                    placeholder='Select Stop'
                                    options={stopsList}
                                    isMulti={false}
                                    isSearchable={true}
                                    onChange={handleStop}
                                    layer='first'
                                />
                            }
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
};