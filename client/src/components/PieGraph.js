import React from 'react';
// DevExpress
import PieChart, { 
    Legend,
    Series,
    Label,
    Font,
    Connector
} from 'devextreme-react/pie-chart';

export default function PieGraph({dataSource, palette, title}) {
    
    const keyNames = Object.keys(dataSource[0]);
    const legendFont = {
        color: 'black',
    }
    const graphTitle = {
        text: title,
        font: {
            color: 'black',
            size: 20,
        },
    }

    return (
        <PieChart
            title={graphTitle}
            palette={palette}
            dataSource={dataSource}>
            <Legend
                orientation="horizontal"
                verticalAlignment="bottom"
                horizontalAlignment="center"
                itemTextPosition="right"
                rowCount={1}
                font={legendFont}
            />
            <Series argumentField={keyNames[0]} valueField={keyNames[1]}>
                <Label 
                    visible={true} 
                    position="columns"
                    customizeText={customizeText}>
                    <Font size={12} />
                    <Connector visible={true} width={0.5} />
                </Label>
            </Series>
        </PieChart>
    )
}

function customizeText(arg) {
    return `${arg.valueText} (${arg.percentText})`;
}