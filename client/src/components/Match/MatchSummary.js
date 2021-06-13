import React from 'react';
// MUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {
    Chart,
    Series,
    ArgumentAxis,
    CommonSeriesSettings,
    Export,
    Legend,
    Margin,
    Title,
    Subtitle,
    Tooltip,
    CommonAxisSettings,
    Font,
    Label,
    Format
  } from 'devextreme-react/chart';

import ChampionSquare from '../ChampionSquare';
import ItemSquare from '../ItemSquare';
import SpellSquare from '../SpellSquare';

const StyledTableCellBlue = withStyles((theme) => ({
    head: {
        backgroundColor: "#1241CE",
        color: theme.palette.common.white,
        fontSize: 20
    }
}))(TableCell);

const StyledTableCellRed = withStyles((theme) => ({
    head: {
        backgroundColor: "#CB2C31",
        color: theme.palette.common.white,
        fontSize: 20
    }
}))(TableCell);

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        marginTop: theme.spacing(2),
        'text-decoration': 'bold',
        fontSize: 'large',
    },
}));

export default function MatchSummary({ match }) {
    const classes = useStyles();
    console.log(match);

    // used for the gold data
    // the graphs are typically a gold difference at a point in time
    // so our x-axis will be the minute and the y-axis the blue-red calc
    let goldChartData = [];
    let maxGoldDiff = 0;

    for (const i in match.Timeline) {
        let obj = {
            minute: match.Timeline[i].MinuteStamp,
            goldDiff: (match.Timeline[i].BlueTeamGold - match.Timeline[i].RedTeamGold)
        };

        if (Math.abs(obj.goldDiff) > maxGoldDiff) {
            maxGoldDiff = Math.abs(obj.goldDiff);
        }

        goldChartData.push(obj);
    }

    let argumentAxisSettings = {
        color: '#000000'
    };

    let valueAxisSettings = {
        color: '#000000',
        visualRange: {
            startValue: maxGoldDiff * -1 * 1.02,
            endValue: maxGoldDiff * 1.02
        }
    };

    let blueTeamName = match.Teams['100'].TeamName;
    let redTeamName = match.Teams['200'].TeamName;

    let winningTeam = match.Teams['100'].Win === true ? blueTeamName : redTeamName;

    // Vision
    let visionData = [];

    for (const t in match.Teams) {
        const item = match.Teams[t];
        const obj = {
            team: item.TeamName,
            wardsPlaced: item.TeamWardsPlaced,
            wardsCleared: item.TeamWardsCleared
        };

        visionData.push(obj);
    }

    // Damage Distribution
    let damageDistribution = [
        {
            lane: 'Top',
            blueDamage: parseFloat(match.Teams['100'].Players['1'].DamageDealtPct) * 100,
            redDamage: parseFloat(match.Teams['200'].Players['6'].DamageDealtPct) * 100
        },
        {
            lane: 'Jungle',
            blueDamage: parseFloat(match.Teams['100'].Players['2'].DamageDealtPct) * 100,
            redDamage: parseFloat(match.Teams['200'].Players['7'].DamageDealtPct) * 100
        },
        {
            lane: 'Mid',
            blueDamage: parseFloat(match.Teams['100'].Players['3'].DamageDealtPct) * 100,
            redDamage: parseFloat(match.Teams['200'].Players['8'].DamageDealtPct) * 100
        },
        {
            lane: 'ADC',
            blueDamage: parseFloat(match.Teams['100'].Players['4'].DamageDealtPct) * 100,
            redDamage: parseFloat(match.Teams['200'].Players['9'].DamageDealtPct) * 100
        },
        {
            lane: 'Support',
            blueDamage: parseFloat(match.Teams['100'].Players['5'].DamageDealtPct) * 100,
            redDamage: parseFloat(match.Teams['200'].Players['10'].DamageDealtPct) * 100
        },
    ];

    // Gold Distribution
    let goldDistribution = [
        {
            lane: 'Top',
            blue: parseFloat(match.Teams['100'].Players['1'].GoldPct) * 100,
            red: parseFloat(match.Teams['200'].Players['6'].GoldPct) * 100
        },
        {
            lane: 'Jungle',
            blue: parseFloat(match.Teams['100'].Players['2'].GoldPct) * 100,
            red: parseFloat(match.Teams['200'].Players['7'].GoldPct) * 100
        },
        {
            lane: 'Mid',
            blue: parseFloat(match.Teams['100'].Players['3'].GoldPct) * 100,
            red: parseFloat(match.Teams['200'].Players['8'].GoldPct) * 100
        },
        {
            lane: 'Bottom',
            blue: parseFloat(match.Teams['100'].Players['4'].GoldPct) * 100,
            red: parseFloat(match.Teams['200'].Players['9'].GoldPct) * 100
        },
        {
            lane: 'Support',
            blue: parseFloat(match.Teams['100'].Players['5'].GoldPct) * 100,
            red: parseFloat(match.Teams['200'].Players['10'].GoldPct) * 100
        },
    ];

    let otherStats = [
        {
            name: 'End Gold',
            blue: match.Teams['100'].TeamGold,
            red: match.Teams['200'].TeamGold,
        },
        {
            name: 'Total Kills',
            blue: match.Teams['100'].TeamKills,
            red: match.Teams['200'].TeamKills,
        },
        {
            name: 'Total Deaths',
            blue: match.Teams['100'].TeamDeaths,
            red: match.Teams['200'].TeamDeaths,
        },
        {
            name: 'Total Assists',
            blue: match.Teams['100'].TeamAssists,
            red: match.Teams['200'].TeamAssists,
        },
        {
            name: 'Towers',
            blue: match.Teams['100'].Towers,
            red: match.Teams['200'].Towers,
        },
        {
            name: 'Inhibitors',
            blue: match.Teams['100'].Inhibitors,
            red: match.Teams['200'].Inhibitors,
        },
        {
            name: 'Vision Score',
            blue: match.Teams['100'].TeamVisionScore,
            red: match.Teams['200'].TeamVisionScore,
        },
        {
            name: 'Damage Dealt',
            blue: match.Teams['100'].TeamDamageDealt,
            red: match.Teams['200'].TeamDamageDealt,
        },
    ];
    

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <h1>Winner: {winningTeam}</h1>
                </Grid>
                <Grid item xs={6}>
                    <TableContainer component={Paper} className={classes.paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                <StyledTableCellBlue>Player</StyledTableCellBlue>
                                <StyledTableCellBlue></StyledTableCellBlue>
                                <StyledTableCellBlue></StyledTableCellBlue>
                                <StyledTableCellBlue>K/D/A</StyledTableCellBlue>
                                <StyledTableCellBlue>CS</StyledTableCellBlue>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(match.Teams['100'].Players).map(([playerNum, player]) => (
                                <TableRow key={playerNum}>
                                    <TableCell>
                                        <ChampionSquare id={player.ChampId} width='40' height='40'></ChampionSquare>
                                        <a href={`/profile/${player.ProfileName}/games/${match.SeasonShortName}`}>{player.ProfileName}</a>
                                    </TableCell>
                                    <TableCell>
                                        <SpellSquare id={player.Spell1Id} key={player.Spell1Id} width='40' height='40'></SpellSquare>
                                        <SpellSquare id={player.Spell2Id} key={player.Spell2Id} width='40' height='40'></SpellSquare>
                                    </TableCell>
                                    <TableCell>
                                        {player.ItemsFinal.map((itemId, index) => (
                                            <ItemSquare id={itemId} key={`${index}+${itemId}`} width='40' height='40'></ItemSquare>
                                        ))}
                                    </TableCell>
                                    <TableCell>{player.Kills}/{player.Deaths}/{player.Assists}</TableCell>
                                    <TableCell>{player.CreepScore}</TableCell>
                                </TableRow>
                                ))}
                                
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={6}>
                    <TableContainer component={Paper} className={classes.paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                <StyledTableCellRed>Player</StyledTableCellRed>
                                <StyledTableCellRed></StyledTableCellRed>
                                <StyledTableCellRed></StyledTableCellRed>
                                <StyledTableCellRed>K/D/A</StyledTableCellRed>
                                <StyledTableCellRed>CS</StyledTableCellRed>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(match.Teams['200'].Players).map(([playerNum, player]) => (
                                <TableRow key={playerNum}>
                                    <TableCell>
                                        <ChampionSquare id={player.ChampId} width='40' height='40'></ChampionSquare>
                                        <a href={`/profile/${player.ProfileName}/games/${match.SeasonShortName}`}>{player.ProfileName}</a>
                                    </TableCell>
                                    <TableCell>
                                        <SpellSquare id={player.Spell1Id} key={player.Spell1Id} width='40' height='40'></SpellSquare>
                                        <SpellSquare id={player.Spell2Id} key={player.Spell2Id} width='40' height='40'></SpellSquare>
                                    </TableCell>
                                    <TableCell>
                                        {player.ItemsFinal.map((itemId, index) => (
                                            <ItemSquare id={itemId} key={`${index}+${itemId}`} width='40' height='40'></ItemSquare>
                                        ))}
                                    </TableCell>
                                    <TableCell>{player.Kills}/{player.Deaths}/{player.Assists}</TableCell>
                                    <TableCell>{player.CreepScore}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={6}>
                    <Paper elevation={3}>
                        <Chart id="wardsChart" dataSource={visionData}>
                            <CommonSeriesSettings argumentField="state" type="bar" hoverMode="allArgumentPoints" selectionMode="allArgumentPoints">
                                <Label visible={true}>
                                    <Format type="fixedPoint" precision={0} />
                                </Label>
                            </CommonSeriesSettings>
                            <Title text="Vision">
                                <Font color="black"></Font>
                            </Title>
                            <Series argumentField="team" valueField="wardsPlaced" name="Wards Placed" />
                            <Series argumentField="team" valueField="wardsCleared" name="Wards Cleared" />
                            <Legend verticalAlignment="bottom" horizontalAlignment="center"></Legend>
                        </Chart>
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <Paper elevation={3}>
                        <Chart id="damagePercentChart" dataSource={damageDistribution}>
                            <CommonSeriesSettings argumentField="state" type="bar" hoverMode="allArgumentPoints" selectionMode="allArgumentPoints">
                                <Label visible={true}>
                                    <Format type="fixedPoint" precision={0} />
                                </Label>
                            </CommonSeriesSettings>
                            <Title text="Damage Percentages by Role">
                                <Font color="black"></Font>
                            </Title>
                            <Series argumentField="lane" valueField="blueDamage" name={blueTeamName} />
                            <Series argumentField="lane" valueField="redDamage" name={redTeamName} />
                            <Legend verticalAlignment="bottom" horizontalAlignment="center"></Legend>
                        </Chart>
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <Paper elevation={3}>
                        <Chart id="goldPercentChart" dataSource={goldDistribution}>
                            <CommonSeriesSettings argumentField="state" type="bar" hoverMode="allArgumentPoints" selectionMode="allArgumentPoints">
                                <Label visible={true}>
                                    <Format type="fixedPoint" precision={0} />
                                </Label>
                            </CommonSeriesSettings>
                            <Title text="Gold Percentages by Role">
                                <Font color="black"></Font>
                            </Title>
                            <Series argumentField="lane" valueField="blue" name={blueTeamName} />
                            <Series argumentField="lane" valueField="red" name={redTeamName} />
                            <Legend verticalAlignment="bottom" horizontalAlignment="center"></Legend>
                        </Chart>
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                <TableCell>Stats</TableCell>
                                <TableCell>{blueTeamName}</TableCell>
                                <TableCell>{redTeamName}</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    otherStats.map(item =>
                                        <TableRow key={item.name}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.blue}</TableCell>
                                            <TableCell>{item.red}</TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            {/* Going to move this to another tab soon */}
            {/* <Box paddingTop={3}>
                <Paper elevation={3}>
                    <Chart dataSource={goldChartData} argumentAxis={argumentAxisSettings} valueAxis={valueAxisSettings}>
                        <CommonSeriesSettings argumentField="minute" type="line" />
                        <Series key="goldDiff" valueField="goldDiff" />
                        <Title text="Gold Difference Over Time">
                            <Font color="black"></Font>
                        </Title>
                        <Tooltip enabled={true} />
                        <Legend visible={false}></Legend>
                    </Chart>
                </Paper>
            </Box> */}
        </div>
    )
}