import GlobeComponent from "../components/Globe/GlobeComponent"

export default function Home () {
    return (
        <>
            <p>Hello home!</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GlobeComponent />
            </div>
        </>
    )
}