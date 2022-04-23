import Link from 'next/link';
import Head from "next/head";
import Layout from "../../components/Layout/Layout";
import styles from "./Country.module.css";
import { useState } from 'react';

export default function Country({ country, neighbors }) {
    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
    const [time, setTime] = useState();

    const timeArr = country.timezones[0].replace(/[^\d-:]/gm, "").split(":");
    if (timeArr[1] === "30") {
        timeArr[1] = "50";
    } else if (timeArr[1] === "45") {
        timeArr[1] = "75"
    }
    const offset = Number(timeArr.join("."));

    const curTime = setInterval(() => {
        setTime(new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000) + (3600000*offset)).toLocaleTimeString());
    }, 1000);
    setTimeout(() => {
        clearInterval(curTime)
    }, 1001)

    return (
        <Layout>
            <Head>
                <title>{country.name}</title>
            </Head>
            <div className={styles.indCtryPage}>
                {/* Title Card */}
                <div className={styles.titleCard}>
                    <img className={styles.ctryFlag} src={country.flags.svg} alt={country.name + ' Flag'} />
                    <div className={styles.titleCardTop}>
                        <h1 className={`${styles.descText} ${styles.countryName}`}>{country.name} {country.name !== country.nativeName ? `(${country.nativeName})` : ""}</h1>
                        <h2 className={`${styles.descText} ${styles.subregion}`}>{country.subregion}</h2>
                    </div>
                    <div className={styles.titleCardBtm}>
                        <div>
                            <h3 className={styles.titleNumbers}>{country.population ? country.population.toLocaleString() : "N/A"}</h3>
                            <h4 className={styles.category}>Population</h4>
                        </div>
                        <div>
                            <h3 className={styles.titleNumbers}>{country.area ? country.area.toLocaleString() : "N/A"}</h3>
                            <h4 className={styles.category}>Area (km²)</h4>
                        </div>
                    </div>
                </div>

                {/* Country Info */}
                <div className={styles.ctryInfo}>
                    <div className={styles.ctryInfoRow}>
                        <p className={styles.category}>Capital</p>
                        <p className={styles.descText}>{country.capital}</p>
                    </div>
                    <div className={styles.ctryInfoRow}>
                        <p className={styles.category}>Official {country.demonym} Language{country.languages.length > 1 ? "s" : ""}</p>
                        <p className={styles.descText}>{formatter.format(country.languages.map(language => language.name))}</p>
                    </div>
                    <div className={styles.ctryInfoRow}>
                        <p className={styles.category}>{country.demonym} {country.currencies.length > 1 ? "Currencies" : "Currency"}</p>
                        <p className={styles.descText}>{formatter.format(country.currencies.map(currency => `${currency.name} ( ${currency.symbol} )`))}</p>
                    </div>
                    <div className={styles.ctryInfoRow}>
                        <p className={styles.category}>Income Inequality</p>
                        <p className={styles.descText}>{country.gini ? `${country.gini}%` : "N/A"}</p>
                    </div>
                    <div className={styles.ctryInfoRow}>
                        <p className={styles.category}>Local Time</p>
                        <p className={styles.descText}>{time}</p>
                    </div>
                    <div className={styles.ctryInfoRow}>
                        <p className={styles.category}>Time Zone{country.timezones.length > 1 ? "s" : ""}</p>
                        <p className={`${styles.descText} ${styles.timezones}`}>{formatter.format(country.timezones)}</p>
                    </div>
                    <div className={`${styles.ctryInfoRow} ${styles.ctrysContainer}`}>
                        <p className={`${styles.category} ${styles.borderCtrysTitle}`}>Neighboring Countries</p>
                        {neighbors.length > 0 ? <div className={styles.borderCtrysContainer}>
                            {neighbors.map(neighbor => {
                                return <div className={styles.ctryCard}>
                                    <Link href={`/country/${neighbor.alpha3Code}`} key={neighbor.name}>
                                        <div className={styles.borderCtrys}>
                                            <img className={styles.borderFlag} src={neighbor.flags.svg} alt={`${neighbor.name}'s Flag`} />
                                            <p className={`${styles.descText} ${styles.borderCtryName}`}>{neighbor.name}</p>
                                        </div>
                                    </Link>
                                </div>
                            })}
                        </div> : `${country.name} ${country.name.endsWith("s") ? "have" : "has"} no neighbors`}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export async function getServerSideProps({ params }) {
    const req = await fetch(`https://restcountries.com/v2/alpha/${params.id}`);
    const country = await req.json();
    const borders = country.borders || [];
    const neighbors = await Promise.all(
        borders.map(async border => { 
            return (await (await fetch(`https://restcountries.com/v2/alpha?codes=${border}`)).json())[0]
        })
    );
    return {
        props: { country, neighbors }
    }
}